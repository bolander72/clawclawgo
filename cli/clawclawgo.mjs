#!/usr/bin/env node
/**
 * ClawClawGo CLI: Cross-platform agent skills aggregator
 * 
 * Usage:
 *   clawclawgo export [dir] [--out file]
 *   clawclawgo scan <file|url|--stdin>
 *   clawclawgo preview <file|url|--stdin>
 *   clawclawgo publish [dir]
 *   clawclawgo search <query>
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// ── Agent Detection Heuristics ──

const AGENT_MARKERS = {
  'agent-skills': { files: ['SKILL.md'], note: 'Compatible with 30+ agents' },
  'claude-code': { files: ['CLAUDE.md', '.claude/'], note: 'Claude Code config' },
  'cursor': { files: ['.cursorrules', '.cursor/rules/'], note: 'Cursor rules' },
  'windsurf': { files: ['.windsurfrules'], note: 'Windsurf config' },
  'openclaw': { files: ['AGENTS.md', 'openclaw.json'], note: 'OpenClaw/Codex config' },
  'cline': { files: ['.clinerules', '.cline/'], note: 'Cline rules' },
  'aider': { files: ['.aider.conf.yml'], note: 'Aider config' },
  'continue': { files: ['.continue/config.json'], note: 'Continue config' },
  'codex': { files: ['codex.json'], note: 'OpenAI Codex config' },
};

// ── Helpers ──

function tryExec(cmd) {
  try {
    return execSync(cmd, { stdio: ['pipe', 'pipe', 'pipe'] }).toString().trim();
  } catch {
    return undefined;
  }
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
  
  const yaml = match[1];
  const meta = {};
  
  for (const line of yaml.split('\n')) {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) {
      const value = rest.join(':').trim();
      // Remove quotes
      meta[key.trim()] = value.replace(/^["']|["']$/g, '');
    }
  }
  
  return meta;
}

function walkDir(dir, callback) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.')) {
      walkDir(fullPath, callback);
    } else if (entry.isFile()) {
      callback(fullPath, entry.name);
    }
  }
}

// ── Export Command ──

function exportBuild(dir = '.', outFile = null) {
  const targetDir = path.resolve(dir);
  const detectedFiles = [];
  const compatibility = new Set();
  const skills = [];
  const configs = [];

  // Detect files and infer compatibility
  for (const [agent, { files }] of Object.entries(AGENT_MARKERS)) {
    for (const marker of files) {
      const fullPath = path.join(targetDir, marker);
      if (fs.existsSync(fullPath)) {
        detectedFiles.push(marker);
        compatibility.add(agent);
        
        // For config files, add to configs array
        if (agent !== 'agent-skills') {
          const stat = fs.statSync(fullPath);
          if (stat.isFile()) {
            const content = fs.readFileSync(fullPath, 'utf8');
            configs.push({
              file: marker,
              agent,
              preview: scrubPII(content.slice(0, 500)) + (content.length > 500 ? '...' : ''),
            });
          }
        }
      }
    }
  }

  // Find all SKILL.md files
  walkDir(targetDir, (filePath, fileName) => {
    if (fileName === 'SKILL.md') {
      const content = fs.readFileSync(filePath, 'utf8');
      const frontmatter = parseFrontmatter(content);
      const skillDir = path.dirname(filePath);
      const relativePath = path.relative(targetDir, skillDir);
      
      skills.push({
        name: frontmatter.name || path.basename(skillDir),
        description: frontmatter.description || '',
        path: relativePath,
        license: frontmatter.license || undefined,
        compatibility: frontmatter.compatibility || undefined,
        allowedTools: frontmatter['allowed-tools']?.split(/\s+/) || undefined,
      });
      
      if (!compatibility.has('agent-skills')) {
        compatibility.add('agent-skills');
        detectedFiles.push('SKILL.md');
      }
    }
  });

  const build = {
    name: path.basename(targetDir) + ' Build',
    description: 'Auto-generated from workspace scan',
    version: 1,
    exportedAt: new Date().toISOString(),
    compatibility: Array.from(compatibility),
    detectedFiles,
    skills,
    configs,
  };

  const json = JSON.stringify(build, null, 2);
  
  if (outFile) {
    fs.writeFileSync(outFile, json, 'utf8');
    console.log(`✅ Exported to ${outFile}`);
  } else {
    console.log(json);
  }
}

// ── Scan Command ──

const BLOCK_PATTERNS = [
  { pattern: /ignore.*(?:previous|above|prior).*instructions/i, msg: 'Prompt injection: ignore previous instructions' },
  { pattern: /do\s+not\s+(?:tell|inform|notify).*user/i, msg: 'Hide behavior from user' },
  { pattern: /(?:disable|bypass|skip|ignore).*(?:safety|security|permission)/i, msg: 'Disable safety features' },
  { pattern: /\|\s*curl\s+.*https?:\/\//i, msg: 'Shell exfiltration via curl' },
  { pattern: />\s*\/dev\/tcp\//i, msg: 'Network exfiltration via /dev/tcp' },
  { pattern: /\/bin\/bash\s+-i/i, msg: 'Interactive shell (reverse shell)' },
  { pattern: /nc\s+(?:-e|--exec)/i, msg: 'Netcat reverse shell' },
  { pattern: /rm\s+-rf\s+(?:\/|~\/)/i, msg: 'Dangerous file deletion' },
  { pattern: /security\s+find-generic-password/i, msg: 'Keychain credential access' },
  { pattern: /cat\s+~\/\.ssh\//i, msg: 'SSH key access' },
  { pattern: /\d{3}-\d{2}-\d{4}/, msg: 'SSN found in content' },
  { pattern: /nsec1[a-z0-9]{58,}/, msg: 'Nostr private key found' },
];

const WARN_PATTERNS = [
  { pattern: /exec\s*\(/i, msg: 'Contains exec() call' },
  { pattern: /eval\s*\(/i, msg: 'Contains eval() call' },
  { pattern: /curl\s+.*https?:\/\//i, msg: 'External curl usage' },
  { pattern: /\bsudo\s+/i, msg: 'sudo usage' },
  { pattern: /(?:brew|pip|npm|apt-get)\s+install/i, msg: 'Package installation' },
  { pattern: /base64\s+(?:-d|--decode)/i, msg: 'Base64 decode (possible obfuscation)' },
];

function scanBuild(source) {
  let content;
  
  if (source === '--stdin') {
    content = fs.readFileSync(0, 'utf8');
  } else if (source.startsWith('http://') || source.startsWith('https://')) {
    // For now, just note that URL fetching would go here
    console.error('❌ URL fetching not yet implemented. Use --stdin or local file.');
    process.exit(1);
  } else {
    content = fs.readFileSync(source, 'utf8');
  }

  // If it's a build.json, scan the content
  let build;
  try {
    build = JSON.parse(content);
  } catch {
    // If not JSON, scan as raw content
    build = { configs: [{ preview: content }], skills: [] };
  }

  const findings = [];
  
  function scanText(text, location, patterns, severity) {
    for (const { pattern, msg } of patterns) {
      if (pattern.test(text)) {
        const match = text.match(pattern)?.[0]?.slice(0, 100);
        findings.push({ severity, location, message: msg, match });
      }
    }
  }

  // Scan config previews
  for (let i = 0; i < (build.configs || []).length; i++) {
    const config = build.configs[i];
    scanText(config.preview || '', `configs[${i}]`, BLOCK_PATTERNS, 'block');
    scanText(config.preview || '', `configs[${i}]`, WARN_PATTERNS, 'warn');
  }

  // Scan skills (if we had full content)
  const allText = JSON.stringify(build);
  scanText(allText, 'build', BLOCK_PATTERNS, 'block');
  scanText(allText, 'build', WARN_PATTERNS, 'warn');

  // Trust scoring
  let score = 50; // Base score
  const blockCount = findings.filter(f => f.severity === 'block').length;
  const warnCount = findings.filter(f => f.severity === 'warn').length;
  
  if (blockCount === 0) score += 30;
  if (warnCount === 0) score += 20;
  
  score -= blockCount * 20;
  score -= warnCount * 5;
  score = Math.max(0, Math.min(100, score));

  // Report
  console.log(`\n🔒 Security Scan Results\n`);
  
  const blocked = findings.filter(f => f.severity === 'block');
  const warnings = findings.filter(f => f.severity === 'warn');
  
  if (blocked.length > 0) {
    console.log(`❌ BLOCKED (${blocked.length})`);
    for (const f of blocked) {
      console.log(`  ${f.location}: ${f.message}`);
      if (f.match) console.log(`  → "${f.match}"`);
    }
    console.log('');
  }
  
  if (warnings.length > 0) {
    console.log(`⚠️  WARNINGS (${warnings.length})`);
    for (const f of warnings) {
      console.log(`  ${f.location}: ${f.message}`);
    }
    console.log('');
  }
  
  console.log(`Trust Score: ${score}/100`);
  console.log(`Summary: ${blockCount} blocked, ${warnCount} warnings\n`);
  
  if (blocked.length > 0) {
    console.log('❌ This build has blocking security issues.');
  } else if (warnings.length > 0) {
    console.log('⚠️  Review warnings before use.');
  } else {
    console.log('✅ No blocking issues found.');
  }
}

// ── Preview Command ──

function previewBuild(source) {
  let content;
  
  if (source === '--stdin') {
    content = fs.readFileSync(0, 'utf8');
  } else if (source.startsWith('http://') || source.startsWith('https://')) {
    console.error('❌ URL fetching not yet implemented. Use --stdin or local file.');
    process.exit(1);
  } else {
    content = fs.readFileSync(source, 'utf8');
  }

  const build = JSON.parse(content);
  
  console.log(`\n📦 ${build.name}`);
  console.log(`   ${build.description || 'No description'}`);
  console.log(`   Exported: ${build.exportedAt || 'unknown'}`);
  console.log('');
  
  if (build.compatibility?.length) {
    console.log(`🔧 Compatibility: ${build.compatibility.join(', ')}`);
    console.log('');
  }
  
  if (build.detectedFiles?.length) {
    console.log(`📁 Detected Files:`);
    for (const file of build.detectedFiles) {
      console.log(`   ${file}`);
    }
    console.log('');
  }
  
  if (build.skills?.length) {
    console.log(`🔧 Skills (${build.skills.length}):`);
    for (const skill of build.skills) {
      console.log(`   ${skill.name}`);
      if (skill.description) console.log(`      ${skill.description.slice(0, 80)}`);
    }
    console.log('');
  }
  
  if (build.configs?.length) {
    console.log(`⚙️  Configs (${build.configs.length}):`);
    for (const config of build.configs) {
      console.log(`   ${config.file} (${config.agent})`);
    }
    console.log('');
  }
}

// ── Publish Command ──

function publishBuild(dir = '.') {
  const targetDir = path.resolve(dir);
  
  // Get git remote URL
  let gitUrl;
  try {
    gitUrl = tryExec(`git -C "${targetDir}" remote get-url origin`);
  } catch {
    console.error('❌ Not a git repository or no remote origin configured.');
    process.exit(1);
  }
  
  if (!gitUrl) {
    console.error('❌ No git remote URL found.');
    process.exit(1);
  }
  
  console.log(`\n📤 Preparing to publish: ${gitUrl}\n`);
  
  // Run export
  const build = {};
  const detectedFiles = [];
  const compatibility = new Set();
  const skills = [];
  
  for (const [agent, { files }] of Object.entries(AGENT_MARKERS)) {
    for (const marker of files) {
      const fullPath = path.join(targetDir, marker);
      if (fs.existsSync(fullPath)) {
        detectedFiles.push(marker);
        compatibility.add(agent);
      }
    }
  }
  
  walkDir(targetDir, (filePath, fileName) => {
    if (fileName === 'SKILL.md') {
      const content = fs.readFileSync(filePath, 'utf8');
      const frontmatter = parseFrontmatter(content);
      const skillDir = path.dirname(filePath);
      const relativePath = path.relative(targetDir, skillDir);
      
      skills.push({
        name: frontmatter.name || path.basename(skillDir),
        description: frontmatter.description || '',
      });
      
      if (!compatibility.has('agent-skills')) {
        compatibility.add('agent-skills');
      }
    }
  });
  
  build.compatibility = Array.from(compatibility);
  build.skills = skills;
  build.detectedFiles = detectedFiles;
  
  console.log('✅ Export complete');
  console.log(`   Skills: ${skills.length}`);
  console.log(`   Compatibility: ${build.compatibility.join(', ')}`);
  console.log('');
  
  // Run scan
  console.log('🔒 Running security scan...');
  const allText = JSON.stringify(build);
  const findings = [];
  
  for (const { pattern, msg } of BLOCK_PATTERNS) {
    if (pattern.test(allText)) {
      findings.push({ severity: 'block', message: msg });
    }
  }
  
  if (findings.length > 0) {
    console.log('❌ Security scan failed:');
    for (const f of findings) {
      console.log(`   ${f.message}`);
    }
    console.log('');
    console.log('Fix these issues before publishing.');
    process.exit(1);
  }
  
  console.log('✅ Security scan passed\n');
  
  // Generate registry entry
  const entry = {
    url: gitUrl,
    name: build.skills[0]?.name || path.basename(targetDir),
    description: build.skills[0]?.description || 'Agent skills build',
    compatibility: build.compatibility,
    tags: build.skills.map(s => s.name.split('-')[0]).filter((v, i, a) => a.indexOf(v) === i),
    addedAt: new Date().toISOString(),
  };
  
  console.log('📝 Registry Entry:');
  console.log(JSON.stringify(entry, null, 2));
  console.log('');
  console.log('To publish, submit a PR to:');
  console.log('https://github.com/bolander72/clawclawgo');
  console.log('');
  console.log('Add this entry to registry/builds.json');
}

// ── Search Command ──

function searchBuilds(query) {
  console.log(`🔍 Search is available at:`);
  console.log(`https://clawclawgo.com/search?q=${encodeURIComponent(query)}`);
}

// ── CLI ──

const args = process.argv.slice(2);
const command = args[0];

function getArg(flag) {
  const idx = args.indexOf(flag);
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : null;
}

try {
  switch (command) {
    case 'export': {
      const dir = args[1] || '.';
      const outFile = getArg('--out');
      exportBuild(dir, outFile);
      break;
    }
    
    case 'scan': {
      const source = args[1];
      if (!source) {
        console.error('Usage: clawclawgo scan <file|url|--stdin>');
        process.exit(1);
      }
      scanBuild(source);
      break;
    }
    
    case 'preview': {
      const source = args[1];
      if (!source) {
        console.error('Usage: clawclawgo preview <file|url|--stdin>');
        process.exit(1);
      }
      previewBuild(source);
      break;
    }
    
    case 'publish': {
      const dir = args[1] || '.';
      publishBuild(dir);
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
      console.log(`ClawClawGo - Cross-platform agent skills aggregator

Usage:
  clawclawgo export [dir] [--out file]      Export directory as build.json
  clawclawgo scan <file|--stdin>            Security scan a build
  clawclawgo preview <file|--stdin>         Preview build contents
  clawclawgo publish [dir]                  Prepare build for registry
  clawclawgo search <query>                 Search for builds

Examples:
  clawclawgo export ~/my-skills --out build.json
  clawclawgo scan build.json
  cat build.json | clawclawgo preview --stdin
  clawclawgo publish ~/my-skills`);
  }
} catch (err) {
  console.error(`❌ ${err.message}`);
  process.exit(1);
}
