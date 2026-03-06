function requireShortCommit(changeset) {
  if (!changeset.commit) {
    throw new Error(
      `Missing commit hash for changeset "${changeset.id}". Commit hash is required to generate changelog entries.`
    );
  }

  return changeset.commit.slice(0, 7);
}

function getReleaseLine(changeset) {
  const shortCommit = requireShortCommit(changeset);
  const lines = changeset.summary
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return `- ${shortCommit}:`;
  }

  const [firstLine, ...futureLines] = lines;
  let output = `- ${shortCommit}: ${firstLine}`;

  if (futureLines.length > 0) {
    output += `\n${futureLines.map((line) => `  ${line}`).join("\n")}`;
  }

  return output;
}

function getDependencyReleaseLine(changesets, dependenciesUpdated) {
  if (dependenciesUpdated.length === 0) {
    return "";
  }

  const shortCommits = [];
  const shortCommitsSet = new Set();

  for (const changeset of changesets) {
    const shortCommit = requireShortCommit(changeset);
    if (!shortCommitsSet.has(shortCommit)) {
      shortCommitsSet.add(shortCommit);
      shortCommits.push(shortCommit);
    }
  }

  const header = `- ${shortCommits.join(", ")}: Updated dependencies.`;
  const dependencyLines = dependenciesUpdated.map(
    (dependency) => `  - ${dependency.name}@${dependency.newVersion}`
  );

  return [header, ...dependencyLines].join("\n");
}

export default {
  getReleaseLine,
  getDependencyReleaseLine,
};
