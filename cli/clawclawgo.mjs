#!/usr/bin/env node
/**
 * ClawClawGo CLI: Agent kits search engine
 *
 * Usage:
 *   clawclawgo add <repo|owner/repo>       Clone a kit repo and scan it
 *   clawclawgo pack [dir] [--out file]     Pack local skills into a kit.json
 *   clawclawgo scan <file|--stdin>         Security scan a kit file
 *   clawclawgo preview <file|--stdin>      Preview kit contents
 *   clawclawgo publish [dir]               Submit kit to registry
 *   clawclawgo search <query>              Search for kits
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';

// ── Agent Detection Heuristics ──

const AGENT_MARKERS = {
  'agent-skills': { files: ['SKILL.md'], note: 'Compatible with 30+ agents' },
  'claude-code':  { files: ['CLAUDE.md', '.claude/'], note: 'Claude Code' },
  'cursor':       { files: ['.cursorrules', '.cursor/rules/'], note: 'Cursor' },
  'windsurf':     { files: ['.windsurfrules'], note: 'Windsurf' },
  'openclaw':     { files: ['AGENTS.md', 'openclaw.json'], note: 'OpenClaw' },
  'codex':        { files: ['codex.json', 'AGENTS.md'], note: 'OpenAI Codex' },
  'cline':        { files: ['.clinerules', '.cline/'], note: 'Cline' },
  'aider':        { files: ['.aider.conf.yml'], note: 'Aider' },
  'continue':     { files: ['.continue/config.json'], note: 'Continue' },
};

// ── Security Patterns ──

const BLOCK_PATTERNS = [
  { pattern: /ignore.*(?:previous|above|prior).*instructions/i, msg: 'Prompt injection: ignore previous instructions' },
  { pattern: /do\s+not\s+(?:tell|inform|notify).*user/i, msg: 'Hide behavior from user' },
  { pattern: /(?:disable|bypass|skip|ignore).*(?:safety|security|permission)/i, msg: 'Disable safety features' },
  { pattern: /\|\s*curl\s+.*https?:\/\//i, msg: 'Shell exfiltration via curl pipe' },
  { pattern: />\s*\/dev\/tcp\//i, msg: 'Network exfiltration via /dev/tcp' },
  { pattern: /\/bin\/bash\s+-i/i, msg: 'Interactive shell (reverse shell)' },
  { pattern: /nc\s+(?:-e|--exec)/i, msg: 'Netcat reverse shell' },
  { pattern: /rm\s+-rf\s+(?:\/|~\/)/i, msg: 'Dangerous recursive deletion' },
  { pattern: /security\s+find-generic-password/i, msg: 'Keychain credential access' },
  { pattern: /cat\s+~\/\.ssh\//i, msg: 'SSH key access' },
  { pattern: /\d{3}-\d{2}-\d{4}/, msg: 'SSN found in content' },
  { pattern: /nsec1[a-z0-9]{58,}/, msg: 'Private key found' },
];

const WARN_PATTERNS = [
  { pattern: /exec\s*\(/i, msg: 'Contains exec() call' },
  { pattern: /eval\s*\(/i, msg: 'Contains eval() call' },
  { pattern: /curl\s+.*https?:\/\//i, msg: 'External curl usage' },
  { pattern: /\bsudo\s+/i, msg: 'sudo usage' },
  { pattern: /(?:brew|pip|npm|apt-get)\s+install/i, msg: 'Package installation command' },
  { pattern: /base64\s+(?:-d|--decode)/i, msg: 'Base64 decode (possible obfuscation)' },
];

// ── Helpers ──

function tryExec(cmd) {
  try {
    return execSync(cmd, { stdio: ['pipe', 'pipe', 'pipe'] }).toString().trim();
  } catch { return undefined; }
}

function scrubPII(text) {
  if (!text) return text;
  text = text.replace(/\+?1?\d{10,11}/g, '[REDACTED_PHONE]');
  text = text.replace(/[\w.-]+@[\w.-]+\.\w+/g, '[REDACTED_EMAIL]');
  text = text.replace(/\d+\s+[\w\s]+(?:St|Ave|Blvd|Dr|Rd|Ln|Way|Ct)\b[^.\n]*/gi, '[REDACTED_ADDRESS]');
  text = text.replace(/\d{3}-\d{2}-\d{4}/g, '[REDACTED_SSN]');
  return text;
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const meta = {};
  for (const line of match[1].split('\n')) {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) {
      meta[key.trim()] = rest.join(':').trim().replace(/^["']|["']$/g, '');
    }
  }
  return meta;
}

function walkDir(dir, callback, opts = {}) {
  const skipDirs = new Set(['.git', 'node_modules', '.next', 'dist', 'build', '.cache']);
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
  catch { return; }
  for (const entry of entries) {
    if (entry.name.startsWith('.') && !opts.includeDot) {
      // Still check dotfiles for agent markers
      const fullPath = path.join(dir, entry.name);
      if (entry.isFile()) callback(fullPath, entry.name);
      continue;
    }
    if (entry.isDirectory() && skipDirs.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walkDir(fullPath, callback, opts);
    else callback(fullPath, entry.name);
  }
}

async function fetchUrl(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response.text();
}

function readSource(source) {
  if (source === '--stdin') return fs.readFileSync(0, 'utf8');
  return fs.readFileSync(source, 'utf8');
}

// ── Security Scanner ──

function runScan(content) {
  const findings = [];

  function scanText(text, location, patterns, severity) {
    for (const { pattern, msg } of patterns) {
      if (pattern.test(text)) {
        const match = text.match(pattern)?.[0]?.slice(0, 100);
        findings.push({ severity, location, message: msg, match });
      }
    }
  }

  // If JSON, scan structured fields
  let build;
  try {
    build = JSON.parse(content);
  } catch {
    build = null;
  }

  if (build) {
    // Scan config previews
    for (let i = 0; i < (build.configs || []).length; i++) {
      const cfg = build.configs[i];
      const text = cfg.preview || cfg.content || '';
      scanText(text, `configs[${i}] (${cfg.file || cfg.agent || 'unknown'})`, BLOCK_PATTERNS, 'block');
      scanText(text, `configs[${i}]`, WARN_PATTERNS, 'warn');
    }
    // Scan skill descriptions
    for (let i = 0; i < (build.skills || []).length; i++) {
      const skill = build.skills[i];
      const text = [skill.description, skill.name, ...(skill.allowedTools || [])].join(' ');
      scanText(text, `skills[${i}] (${skill.name})`, BLOCK_PATTERNS, 'block');
    }
  }

  // Full-text scan as fallback
  scanText(content, 'content', BLOCK_PATTERNS, 'block');
  scanText(content, 'content', WARN_PATTERNS, 'warn');

  // Deduplicate findings by message
  const seen = new Set();
  const unique = findings.filter(f => {
    const key = `${f.severity}:${f.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Trust score
  const blockCount = unique.filter(f => f.severity === 'block').length;
  const warnCount = unique.filter(f => f.severity === 'warn').length;
  let score = 50;
  if (blockCount === 0) score += 30;
  if (warnCount === 0) score += 20;
  score -= blockCount * 20;
  score -= warnCount * 5;
  score = Math.max(0, Math.min(100, score));

  return {
    trustScore: score,
    blocked: blockCount > 0,
    summary: `${blockCount} blocked, ${warnCount} warnings`,
    findings: unique,
    scannedAt: new Date().toISOString(),
  };
}

function formatScanReport(report) {
  const lines = [`\n🔒 Security Scan Results\n`];
  const blocked = report.findings.filter(f => f.severity === 'block');
  const warnings = report.findings.filter(f => f.severity === 'warn');

  if (blocked.length > 0) {
    lines.push(`❌ BLOCKED (${blocked.length})`);
    for (const f of blocked) {
      lines.push(`  ${f.location}: ${f.message}`);
      if (f.match) lines.push(`  → "${f.match}"`);
    }
    lines.push('');
  }
  if (warnings.length > 0) {
    lines.push(`⚠️  WARNINGS (${warnings.length})`);
    for (const f of warnings) lines.push(`  ${f.location}: ${f.message}`);
    lines.push('');
  }

  lines.push(`Trust Score: ${report.trustScore}/100`);
  lines.push(`Summary: ${report.summary}\n`);

  if (blocked.length > 0) lines.push('❌ This build has blocking security issues.');
  else if (warnings.length > 0) lines.push('⚠️  Review warnings before use.');
  else lines.push('✅ Clean — no issues found.');

  return lines.join('\n');
}

// ── Pack Command ──

function packBuild(dir = '.') {
  const targetDir = path.resolve(dir);
  const dirName = path.basename(targetDir);
  const detectedFiles = [];
  const compatibility = new Set();
  const skills = [];
  const configs = [];

  // Detect agent config files
  for (const [agent, { files }] of Object.entries(AGENT_MARKERS)) {
    for (const marker of files) {
      const fullPath = path.join(targetDir, marker);
      if (fs.existsSync(fullPath)) {
        if (!detectedFiles.includes(marker)) detectedFiles.push(marker);
        compatibility.add(agent);

        // Read config file content (not directories)
        if (agent !== 'agent-skills') {
          try {
            const stat = fs.statSync(fullPath);
            if (stat.isFile()) {
              const content = fs.readFileSync(fullPath, 'utf8');
              configs.push({
                file: marker,
                agent,
                preview: scrubPII(content.slice(0, 500)) + (content.length > 500 ? '...' : ''),
              });
            }
          } catch { /* skip unreadable */ }
        }
      }
    }
  }

  // Find all SKILL.md files
  walkDir(targetDir, (filePath, fileName) => {
    if (fileName !== 'SKILL.md') return;
    const content = fs.readFileSync(filePath, 'utf8');
    const fm = parseFrontmatter(content);
    const skillDir = path.dirname(filePath);
    const relativePath = path.relative(targetDir, skillDir);

    skills.push({
      name: fm.name || path.basename(skillDir),
      description: fm.description || '',
      path: relativePath,
      ...(fm.license && { license: fm.license }),
      ...(fm.compatibility && { compatibility: fm.compatibility }),
      ...(fm['allowed-tools'] && { allowedTools: fm['allowed-tools'].split(/\s+/) }),
    });

    if (!compatibility.has('agent-skills')) {
      compatibility.add('agent-skills');
      if (!detectedFiles.includes('SKILL.md')) detectedFiles.push('SKILL.md');
    }
  });

  // Build the output
  const build = {
    name: `${dirName}`,
    description: `Agent skills from ${dirName}`,
    version: 1,
    exportedAt: new Date().toISOString(),
    compatibility: Array.from(compatibility),
    detectedFiles,
    skills,
    configs,
  };

  // Bake scan results into the build
  const scanResult = runScan(JSON.stringify(build));
  build.scan = {
    trustScore: scanResult.trustScore,
    summary: scanResult.summary,
    blocked: scanResult.blocked,
    scannedAt: scanResult.scannedAt,
    findings: scanResult.findings,
  };

  return build;
}

// ── Add Command ──

async function addKit(source, destDir) {
  // Normalize GitHub URL
  let repoUrl = source;
  if (!repoUrl.startsWith('http://') && !repoUrl.startsWith('https://')) {
    // Might be owner/repo shorthand
    if (repoUrl.match(/^[\w.-]+\/[\w.-]+$/)) {
      repoUrl = `https://github.com/${repoUrl}`;
    } else {
      console.error('❌ Expected a GitHub URL or owner/repo shorthand.');
      console.error('   Example: clawclawgo add garrytan/gstack');
      console.error('   Example: clawclawgo add https://github.com/anthropics/skills');
      process.exit(1);
    }
  }

  // Clean up URL
  repoUrl = repoUrl.replace(/\.git$/, '').replace(/\/$/, '');

  // Extract owner/repo for display
  const match = repoUrl.match(/github\.com\/([^/]+\/[^/]+)/);
  const repoName = match ? match[1] : path.basename(repoUrl);
  const dirName = repoName.split('/').pop();

  const outputDir = destDir || process.cwd();
  const cloneDir = path.join(outputDir, dirName);

  if (fs.existsSync(cloneDir)) {
    console.error(`❌ Directory already exists: ${cloneDir}`);
    console.error('   Remove it first or use --dest to choose another location.');
    process.exit(1);
  }

  console.log(`\n📥 Cloning ${repoName}...`);

  // Clone the repo (shallow for speed)
  try {
    execSync(`git clone --depth 1 "${repoUrl}.git" "${cloneDir}"`, { stdio: 'pipe' });
  } catch (err) {
    console.error(`❌ Clone failed. Is this a valid public GitHub repo?`);
    console.error(`   URL: ${repoUrl}`);
    process.exit(1);
  }

  // Remove .git dir — user doesn't need the history
  const gitDir = path.join(cloneDir, '.git');
  try { fs.rmSync(gitDir, { recursive: true, force: true }); } catch { /* ok */ }

  // Find skills
  const skills = [];
  walkDir(cloneDir, (filePath, fileName) => {
    if (fileName !== 'SKILL.md') return;
    const content = fs.readFileSync(filePath, 'utf8');
    const fm = parseFrontmatter(content);
    const skillDir = path.dirname(filePath);
    const relativePath = path.relative(cloneDir, skillDir);
    skills.push({
      name: fm.name || path.basename(skillDir),
      description: fm.description || '',
      path: relativePath,
    });
  });

  // Security scan
  let scanIssues = false;
  const allContent = [];
  walkDir(cloneDir, (filePath, fileName) => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      allContent.push(content);
    } catch { /* binary files, skip */ }
  });
  const scanResult = runScan(allContent.join('\n---\n'));

  if (scanResult.blocked && !args.includes('--force')) {
    console.log(formatScanReport(scanResult));
    console.error('\n❌ Blocked by security scan. Review the issues above.');
    console.error('   Use --force to override (not recommended).');
    // Clean up
    try { fs.rmSync(cloneDir, { recursive: true, force: true }); } catch { /* ok */ }
    process.exit(1);
  }
  if (scanResult.blocked) {
    console.log('\n⚠️  --force used. Proceeding despite security issues.\n');
    scanIssues = true;
  }

  // Summary
  console.log(`\n✅ Added to ${cloneDir}/`);
  console.log(`   Source: ${repoUrl}`);
  console.log(`   Trust Score: ${scanResult.trustScore}/100`);

  if (skills.length > 0) {
    console.log(`\n⚡ Skills found (${skills.length}):`);
    for (const skill of skills) {
      console.log(`   • ${skill.name}${skill.description ? ' — ' + skill.description.slice(0, 60) : ''}`);
      console.log(`     ${skill.path}/SKILL.md`);
    }
  } else {
    console.log('\n   No SKILL.md files found — check the repo for agent configs.');
    // List detected agent files
    const detectedFiles = [];
    for (const [agent, { files, note }] of Object.entries(AGENT_MARKERS)) {
      for (const marker of files) {
        if (fs.existsSync(path.join(cloneDir, marker))) {
          detectedFiles.push({ file: marker, note });
        }
      }
    }
    if (detectedFiles.length > 0) {
      console.log('   Detected agent files:');
      for (const { file, note } of detectedFiles) {
        console.log(`     ${file} (${note})`);
      }
    }
  }

  if (scanResult.findings.filter(f => f.severity === 'warn').length > 0) {
    console.log(`\n⚠️  ${scanResult.findings.filter(f => f.severity === 'warn').length} scan warnings — run \`clawclawgo scan\` for details.`);
  }

  console.log('');
  return cloneDir;
}

// ── Preview Command ──

function previewBuild(source) {
  const content = readSource(source);
  const build = JSON.parse(content);

  const lines = [
    `\n📦 ${build.name}`,
    `   ${build.description || 'No description'}`,
    `   Exported: ${build.exportedAt || 'unknown'}`,
    '',
  ];

  if (build.compatibility?.length) {
    lines.push(`🔧 Compatible with: ${build.compatibility.join(', ')}`, '');
  }
  if (build.detectedFiles?.length) {
    lines.push('📁 Detected files:');
    for (const f of build.detectedFiles) lines.push(`   ${f}`);
    lines.push('');
  }
  if (build.skills?.length) {
    lines.push(`⚡ Skills (${build.skills.length}):`);
    for (const s of build.skills) {
      lines.push(`   ${s.name}`);
      if (s.description) lines.push(`      ${s.description.slice(0, 80)}`);
    }
    lines.push('');
  }
  if (build.configs?.length) {
    lines.push(`⚙️  Configs (${build.configs.length}):`);
    for (const c of build.configs) lines.push(`   ${c.file} (${c.agent})`);
    lines.push('');
  }
  if (build.scan) {
    lines.push(`🔒 Scan: Trust Score ${build.scan.trustScore}/100 — ${build.scan.summary}`);
    if (build.scan.blocked) lines.push('   ❌ Has blocking security issues');
    else if (build.scan.findings?.some(f => f.severity === 'warn')) lines.push('   ⚠️  Has warnings');
    else lines.push('   ✅ Clean');
    lines.push('');
  }

  console.log(lines.join('\n'));
}

// ── Publish Command ──

const REGISTRY_REPO = 'bolander72/clawclawgo';
const REGISTRY_FILE = 'registry/builds.json';

async function publishBuild(dir = '.') {
  const targetDir = path.resolve(dir);

  // Get git remote
  const gitUrl = tryExec(`git -C "${targetDir}" remote get-url origin`);
  if (!gitUrl) {
    console.error('❌ Not a git repository or no remote origin configured.');
    process.exit(1);
  }

  // Check gh CLI is available
  const ghVersion = tryExec('gh --version');
  if (!ghVersion) {
    console.error('❌ GitHub CLI (gh) is required for publishing.');
    console.error('   Install: https://cli.github.com/');
    process.exit(1);
  }

  // Check gh auth
  const ghAuth = tryExec('gh auth status 2>&1');
  if (!ghAuth || ghAuth.includes('not logged in')) {
    console.error('❌ Not authenticated with GitHub CLI.');
    console.error('   Run: gh auth login');
    process.exit(1);
  }

  console.log(`\n📤 Publishing: ${gitUrl}\n`);

  // Pack + scan
  const build = packBuild(dir);
  const scan = build.scan;

  console.log(`✅ Pack complete`);
  console.log(`   Skills: ${build.skills.length}`);
  console.log(`   Compatibility: ${build.compatibility.join(', ') || 'none detected'}`);
  console.log(`   Trust Score: ${scan.trustScore}/100`);
  console.log('');

  if (scan.blocked) {
    console.log(formatScanReport(scan));
    console.error('\n❌ Fix blocking issues before publishing.');
    process.exit(1);
  }

  // Generate registry entry
  const repoUrl = gitUrl.replace(/\.git$/, '').replace(/^git@github\.com:/, 'https://github.com/');
  const entry = {
    url: repoUrl,
    name: build.name,
    description: build.description,
    compatibility: build.compatibility,
    tags: [...new Set(build.skills.map(s => s.name.split('-')[0]).filter(Boolean))],
    addedAt: new Date().toISOString().split('T')[0],
  };

  // Fetch current registry
  console.log('📥 Fetching current registry...');
  let registryContent;
  try {
    registryContent = tryExec(`gh api repos/${REGISTRY_REPO}/contents/${REGISTRY_FILE} --jq .content | base64 -d`);
    if (!registryContent) throw new Error('empty');
  } catch {
    // Fallback: fetch raw
    registryContent = await fetchUrl(`https://raw.githubusercontent.com/${REGISTRY_REPO}/main/${REGISTRY_FILE}`);
  }

  let registry;
  try {
    registry = JSON.parse(registryContent);
  } catch {
    console.error('❌ Could not parse registry. Submit manually.');
    console.log('\n📝 Registry entry:\n');
    console.log(JSON.stringify(entry, null, 2));
    process.exit(1);
  }

  // Check for duplicate
  const existing = (registry.builds || []).find(b => b.url === entry.url);
  if (existing) {
    console.log(`⚠️  ${entry.url} is already in the registry.`);
    console.log('   To update, edit your existing entry via PR.');
    process.exit(0);
  }

  // Add entry
  if (!registry.builds) registry.builds = [];
  registry.builds.push(entry);
  const updatedRegistry = JSON.stringify(registry, null, 2) + '\n';

  // Create PR via gh CLI
  const branchName = `registry/add-${build.name.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase()}`;
  const prTitle = `registry: add ${entry.name}`;
  const prBody = [
    `## New build: ${entry.name}`,
    '',
    `**URL:** ${entry.url}`,
    `**Skills:** ${build.skills.length}`,
    `**Compatibility:** ${entry.compatibility.join(', ')}`,
    `**Trust Score:** ${scan.trustScore}/100`,
    '',
    '### Entry',
    '```json',
    JSON.stringify(entry, null, 2),
    '```',
    '',
    '_Submitted via `clawclawgo publish`_',
  ].join('\n');

  console.log('🔀 Creating PR...\n');

  try {
    // Fork if needed (no-op if already forked or own repo)
    tryExec(`gh repo fork ${REGISTRY_REPO} --clone=false 2>/dev/null`);

    // Get the user's GitHub username
    const ghUser = tryExec('gh api user --jq .login');
    if (!ghUser) throw new Error('Could not determine GitHub username');

    // Write updated registry to temp file
    const tmpFile = path.join(os.tmpdir(), `clawclawgo-registry-${Date.now()}.json`);
    fs.writeFileSync(tmpFile, updatedRegistry, 'utf8');

    // Use gh api to create/update file on a new branch
    const base64Content = Buffer.from(updatedRegistry).toString('base64');

    // Get main branch SHA
    const mainSha = tryExec(`gh api repos/${ghUser}/clawclawgo/git/ref/heads/main --jq .object.sha`);
    if (!mainSha) throw new Error('Could not get main branch SHA. Is the repo forked?');

    // Create branch
    tryExec(`gh api repos/${ghUser}/clawclawgo/git/refs -f ref=refs/heads/${branchName} -f sha=${mainSha}`);

    // Get current file SHA for update
    const fileSha = tryExec(`gh api repos/${ghUser}/clawclawgo/contents/${REGISTRY_FILE} --jq .sha 2>/dev/null`);

    // Create/update file
    const fileArgs = [
      `gh api repos/${ghUser}/clawclawgo/contents/${REGISTRY_FILE}`,
      `-X PUT`,
      `-f message="${prTitle}"`,
      `-f content="${base64Content}"`,
      `-f branch=${branchName}`,
    ];
    if (fileSha) fileArgs.push(`-f sha=${fileSha}`);
    tryExec(fileArgs.join(' '));

    // Create PR
    const prUrl = tryExec(
      `gh pr create --repo ${REGISTRY_REPO} --head ${ghUser}:${branchName} --title "${prTitle}" --body '${prBody.replace(/'/g, "'\\''")}' 2>&1`
    );

    // Clean up temp file
    try { fs.unlinkSync(tmpFile); } catch { /* ignore */ }

    if (prUrl && prUrl.includes('github.com')) {
      console.log(`✅ PR created: ${prUrl}`);
    } else {
      console.log(`✅ PR submitted to ${REGISTRY_REPO}`);
      if (prUrl) console.log(`   ${prUrl}`);
    }
  } catch (err) {
    // Fallback: print manual instructions
    console.log(`⚠️  Auto-PR failed: ${err.message}`);
    console.log('\n📝 Registry entry (submit manually):\n');
    console.log(JSON.stringify(entry, null, 2));
    console.log(`\nAdd this to ${REGISTRY_FILE} in ${REGISTRY_REPO} and submit a PR.`);
  }
}

// ── Search Command (stub) ──

function searchBuilds(query) {
  console.log(`🔍 Search: https://clawclawgo.com/search?q=${encodeURIComponent(query)}`);
}

// ── CLI Router ──

const args = process.argv.slice(2);
const command = args[0];

function getArg(flag) {
  const idx = args.indexOf(flag);
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : null;
}

(async () => {
try {
  switch (command) {
    case 'pack': {
      const dir = args.find((a, i) => i > 0 && !a.startsWith('-')) || '.';
      const outFile = getArg('--out');
      const build = packBuild(dir);
      const json = JSON.stringify(build, null, 2);
      if (outFile) {
        fs.writeFileSync(outFile, json, 'utf8');
        console.log(`✅ Packed to ${outFile}`);
        console.log(`   Skills: ${build.skills.length}`);
        console.log(`   Trust Score: ${build.scan.trustScore}/100`);
      } else {
        console.log(json);
      }
      break;
    }

    case 'add': {
      const source = args[1];
      const dest = getArg('--dest') || getArg('--to');
      if (!source) {
        console.error('Usage: clawclawgo add <repo-url|owner/repo> [--dest dir]');
        process.exit(1);
      }
      await addKit(source, dest);
      break;
    }

    case 'scan': {
      const source = args[1];
      if (!source) {
        console.error('Usage: clawclawgo scan <file|--stdin>');
        process.exit(1);
      }
      const content = readSource(source);
      const report = runScan(content);
      console.log(formatScanReport(report));
      break;
    }

    case 'preview': {
      const source = args[1];
      if (!source) {
        console.error('Usage: clawclawgo preview <file|--stdin>');
        process.exit(1);
      }
      previewBuild(source);
      break;
    }

    case 'publish': {
      const dir = args.find((a, i) => i > 0 && !a.startsWith('-')) || '.';
      await publishBuild(dir);
      break;
    }

    case 'search': {
      const query = args.slice(1).join(' ');
      if (!query) {
        console.error('Usage: clawclawgo search <query>');
        process.exit(1);
      }
      searchBuilds(query);
      break;
    }

    default:
      console.log(`ClawClawGo — agent kits search engine

Commands:
  add <repo|owner/repo> [--dest dir]   Clone a kit repo and scan it
  pack [dir] [--out file]              Pack local skills into a kit.json
  scan <file|--stdin>                  Security scan a kit file
  preview <file|--stdin>               Preview kit contents
  publish [dir]                        Submit kit to the registry
  search <query>                       Search for kits on the web

Examples:
  clawclawgo add garrytan/gstack
  clawclawgo add https://github.com/anthropics/skills --dest ~/kits
  clawclawgo pack . --out kit.json
  clawclawgo scan kit.json
  clawclawgo publish ~/my-skills
  clawclawgo search "voice assistant"`);
  }
} catch (err) {
  console.error(`❌ ${err.message}`);
  process.exit(1);
}
})();
