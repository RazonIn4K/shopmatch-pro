# GitLab CI/CD Security Integration - shopmatch-pro

This project is integrated with GitLab CI/CD (mirroring to `gitlab.com/razonin4k/shopmatch-pro-ci`) to run automated security scanning and vulnerability checks.

## GitHub to GitLab Mirror

The mirror is driven by `.github/workflows/gitlab-mirror.yml` on every push to `main`.

Current behavior:
- If the GitHub Actions secret `GITLAB_MIRROR_TOKEN` is configured, the workflow pushes `main` and tags to `gitlab.com/razonin4k/shopmatch-pro-ci`.
- If `GITLAB_MIRROR_TOKEN` is missing, the workflow fails and records `GitLab mirror failed` in the step summary. A skipped mirror must not look like a successful GitLab sync.

Operational status as of 2026-06-16:
- `GITLAB_MIRROR_TOKEN` is present in the GitHub repository secret list.
- Workflow dispatch run `27645919309` completed successfully and executed `git push gitlab main --follow-tags`.
- GitHub and GitLab `main` were verified matching at `ebc5aa22c60d8d4dc800c72454a94916f72d7b06` before the Next.js 16.2.9 remediation commit.
- After any new push to `main`, verify the mirror workflow succeeds and GitHub/GitLab heads match before treating GitLab scanners as current.

To rotate or re-create real mirroring:

1. In GitLab, create a token with write access to `razonin4k/shopmatch-pro-ci`.
2. In GitHub, go to `RazonIn4K/shopmatch-pro` -> Settings -> Secrets and variables -> Actions.
3. Add a repository secret named `GITLAB_MIRROR_TOKEN`.
4. Re-run the `Mirror to GitLab` workflow or push a new commit to `main`.
5. Verify the workflow log contains the `git push gitlab main --follow-tags` step and no missing-secret failure.

Local verification commands:

```bash
gh secret list --repo RazonIn4K/shopmatch-pro | grep GITLAB_MIRROR_TOKEN
gh run list --repo RazonIn4K/shopmatch-pro --workflow "Mirror to GitLab" --limit 3
git ls-remote origin refs/heads/main
git ls-remote gitlab refs/heads/main
```

Manual sync fallback if the GitHub secret is invalid or unavailable:

```bash
git push gitlab main --follow-tags
git ls-remote gitlab refs/heads/main HEAD
```

## Pipeline Scoping
To optimize runner usage and prevent scanner noise on feature branches, the pipeline is configured with a global `workflow:rules` constraint. Pipelines will **only run on commits to the `main` branch**.

## Security Scanners Enabled

### 1. SAST (Static Application Security Testing)
- **Purpose:** Analyzes the source code statically to identify vulnerability patterns, security flaws, and code quality weaknesses before deployment.
- **Template:** `Jobs/SAST.gitlab-ci.yml`

### 2. Secret Detection
- **Purpose:** Scans the repository files and commit history to detect accidentally exposed API keys, private tokens, passwords, and other credentials, preventing leaks.
- **Template:** `Jobs/Secret-Detection.gitlab-ci.yml`

### 3. Dependency Scanning
- **Purpose:** Evaluates project dependencies (e.g. `package.json`, lockfiles) to identify third-party packages with known vulnerabilities (CVEs) and warns of needed updates.
- **Template:** `Jobs/Dependency-Scanning.v2.gitlab-ci.yml`

### 4. DAST (Dynamic Application Security Testing)
- **Purpose:** Runs dynamic vulnerability scans against the deployed application's public URL to check for live runtime vulnerabilities (such as XSS, SQLi, and configuration flaws).
- **Target URL:** `https://shopmatch.highencodelearning.com`
- **Trigger Rule:** **Manual Only**. For safety, the `dast` job must be manually triggered from the GitLab pipeline interface to prevent automated active scans on every push.
- **Template:** `DAST.gitlab-ci.yml`
