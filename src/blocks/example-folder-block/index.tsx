import { FolderBlockProps } from "@githubnext/utils";
import { Endpoints } from "@octokit/types";
import { useMemo, useState } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { Bars } from "./bars";
import { Timeline } from "./timeline";

export type Commits =
  Endpoints["GET /repos/{owner}/{repo}/commits"]["response"]["data"];
export type Commit = Commits[0];
export type RawTree =
  Endpoints["GET /repos/{owner}/{repo}/git/trees/{tree_sha}"]["response"]["data"];
export type Tree = RawTree["tree"];
export type CommitWithData = {
  sha: string;
  message: string;
  date: string | undefined;
  tree: Tree;
};
export const getMax = (arr: number[]) =>
  arr.reduce((agg, val) => Math.max(agg, val), 0);

function BlockInner(props: FolderBlockProps) {
  const { onRequestGitHubData, context } = props;
  const { owner, repo } = context;
  const [commit, setCommit] = useState<string | null>(null);

  const fetchAllTheThings = async () => {
    const commits: Commits = (
      await onRequestGitHubData(`/repos/${owner}/${repo}/commits`, {
        path: context.path,
      })
    ).reverse();

    return Promise.all(
      commits.map(async (commit) => {
        const tree = await onRequestGitHubData(
          `/repos/${owner}/${repo}/git/trees/${commit.sha}?recursive=1`
        );
        const date = commit.commit.committer?.date;
        const dateObject = date ? new Date(date) : undefined;
        const formattedDate = dateObject?.toLocaleString();
        return {
          sha: commit.sha,
          message: commit.commit.message,
          date: formattedDate,
          tree: tree.tree.filter((d: Tree[0]) => d.type !== "tree"),
        };
      })
    );
  };

  const { data: commits } = useQuery<CommitWithData[]>(
    "commits",
    fetchAllTheThings,
    {
      refetchOnWindowFocus: false,
      retry: false,
      onSuccess: (data) => {
        if (commit) return;
        setCommit(data[0].sha);
      },
    }
  );

  const activeCommit = useMemo(
    () => commits?.find((d) => d.sha === commit),
    [commit, commits]
  );

  const maxSize = useMemo(
    () =>
      getMax(
        (commits || []).map(({ tree }) => getMax(tree.map((d) => d.size || 0)))
      ),
    [commits]
  );

  let activeCommitIndex = commits?.findIndex((d) => d.sha === commit);

  let beforeTree = activeCommitIndex
    ? commits?.[activeCommitIndex - 1]?.tree
    : undefined;

  return (
    <div className="p-4">
      <div className="Box">
        <Timeline
          commit={commit}
          setCommit={setCommit}
          commits={commits || []}
        />
        {!!activeCommit?.tree && !!maxSize && (
          <Bars
            beforeTree={beforeTree}
            tree={activeCommit?.tree}
            maxSize={maxSize}
          />
        )}
      </div>
    </div>
  );
}

const queryClient = new QueryClient();

export default function (props: FolderBlockProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <BlockInner {...props} />
    </QueryClientProvider>
  );
}
