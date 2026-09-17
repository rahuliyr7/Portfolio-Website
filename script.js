const GITHUB_USERNAME = "rahuliyr7";

document.addEventListener("DOMContentLoaded", loadGitHubProjects);

async function loadGitHubProjects() {
    const grid = document.getElementById("github-grid");
    const status = document.getElementById("github-status");

    try {
        const res = await fetch(
            `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=pushed&per_page=6`
        );
        if (!res.ok) throw new Error(`GitHub API responded ${res.status}`);

        const repos = (await res.json()).filter((r) => !r.fork).slice(0, 6);

        if (!repos.length) {
            status.textContent = "No public repositories yet — check back soon.";
            return;
        }

        grid.innerHTML = repos.map(repoCard).join("");
        status.innerHTML = `<span class="pulse-dot" style="display:inline-block;margin-right:0.4rem;"></span>Live from GitHub · refreshed on page load`;
    } catch (err) {
        status.textContent = "Live feed unavailable right now — view repos directly on GitHub.";
    }
}

function repoCard(repo) {
    const desc = repo.description ? escapeHTML(repo.description) : "No description provided.";
    return `
        <a class="repo-card" href="${repo.html_url}" target="_blank" rel="noopener">
            <div class="repo-card-top">
                <span class="repo-name">${escapeHTML(repo.name)}</span>
                <span class="pulse-dot" title="Recently active"></span>
            </div>
            <p class="repo-desc">${desc}</p>
            <div class="repo-meta">
                ${repo.language ? `<span class="repo-lang"><span class="lang-dot"></span>${escapeHTML(repo.language)}</span>` : ""}
                <span>★ ${repo.stargazers_count}</span>
                <span>Updated ${timeAgo(repo.pushed_at)}</span>
            </div>
        </a>`;
}

function timeAgo(dateString) {
    const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);
    const units = [
        ["year", 31536000],
        ["month", 2592000],
        ["week", 604800],
        ["day", 86400],
        ["hour", 3600],
        ["minute", 60],
    ];
    for (const [name, secs] of units) {
        const val = Math.floor(seconds / secs);
        if (val >= 1) return `${val} ${name}${val > 1 ? "s" : ""} ago`;
    }
    return "just now";
}

function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}
