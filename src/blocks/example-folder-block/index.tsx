import { FolderBlockProps } from "@githubnext/utils";
import { useMemo, useRef, useState, useEffect } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { useFloating, shift, offset, arrow } from "@floating-ui/react-dom";

import { Endpoints } from "@octokit/types";
import { motion } from "framer-motion";

type Commits =
  Endpoints["GET /repos/{owner}/{repo}/commits"]["response"]["data"];
type Commit = Commits[0];
type RawTree =
  Endpoints["GET /repos/{owner}/{repo}/git/trees/{tree_sha}"]["response"]["data"];
type Tree = RawTree["tree"];
type CommitWithData = {
  sha: string;
  message: string;
  date: string | undefined;
  tree: Tree;
};

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

  return (
    <div className="Box m-4">
      {/* timeline to iterate through commits */}
      <Timeline commit={commit} setCommit={setCommit} commits={commits || []} />

      {/* bar chart */}
      {!!activeCommit?.tree && !!maxSize && (
        <Bars tree={activeCommit?.tree} maxSize={maxSize} />
      )}
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

const Timeline = ({
  commit,
  setCommit,
  commits,
}: {
  commit: string | null;
  setCommit: (commit: string | null) => void;
  commits: CommitWithData[];
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const arrowRef = useRef(null);

  const commitIndex = commits.findIndex((d) => d.sha === commit);
  useInterval(
    () => {
      const nextCommitIndex = commitIndex + 1;
      if (nextCommitIndex >= commits.length) setIsPlaying(false);
      const nextCommit = commits[nextCommitIndex];
      setCommit(nextCommit.sha);
    },
    isPlaying ? 500 : null
  );

  const {
    x,
    y,
    reference,
    floating,
    strategy,
    middlewareData: { arrow: { x: arrowX, y: arrowY } = {} },
  } = useFloating({
    placement: "bottom",
    middleware: [shift(), offset(4), arrow({ element: arrowRef })],
  });

  return (
    <div className="w-full p-3 border-b px-3 flex items-center">
      <button
        className="mr-1"
        onClick={() => {
          if (commitIndex === commits.length - 1) {
            setCommit(commits[0].sha);
          }
          setIsPlaying(!isPlaying);
        }}
      >
        {isPlaying ? (
          <svg viewBox="0 0 24 24" width="24" height="24" strokeLinecap="round">
            <path
              d="M 9.5 9.5 L 9.5 14.5"
              strokeWidth="2"
              stroke="currentColor"
            ></path>
            <path
              d="M 14.5 9.5 L 14.5 14.5"
              strokeWidth="2"
              stroke="currentColor"
            ></path>
            <path
              fill-rule="evenodd"
              d="M12 2.5a9.5 9.5 0 100 19 9.5 9.5 0 000-19zM1 12C1 5.925 5.925 1 12 1s11 4.925 11 11-4.925 11-11 11S1 18.075 1 12z"
            ></path>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M9.5 15.584V8.416a.5.5 0 01.77-.42l5.576 3.583a.5.5 0 010 .842l-5.576 3.584a.5.5 0 01-.77-.42z"></path>
            <path
              fill-rule="evenodd"
              d="M12 2.5a9.5 9.5 0 100 19 9.5 9.5 0 000-19zM1 12C1 5.925 5.925 1 12 1s11 4.925 11 11-4.925 11-11 11S1 18.075 1 12z"
            ></path>
          </svg>
        )}
      </button>
      <ul
        className="flex items-center justify-between space-x-2 relative flex-1"
        style={{
          maxWidth: commits.length * 2 + "em",
        }}
      >
        <div className="absolute top-1/2 left-2 right-1 border-b-2 border-black transform -translate-y-[2px]"></div>
        {commits.map(({ sha, message, date }, index) => (
          <li ref={reference} className="relative" key={sha}>
            <button
              className={`truncate w-4 h-4 border-2 border-black hover:bg-gray-500 rounded-full ${
                sha === commit ? "bg-black hover:bg-black" : "bg-white"
              }`}
              onClick={() => {
                setCommit(sha);
                setIsPlaying(false);
              }}
            ></button>
            <div
              ref={floating}
              className="bg-black text-xs font-mono p-1 text-white z-10 relative min-w-[100px] text-center"
              style={{
                position: strategy,
                opacity: sha === commit ? 1 : 0,
                pointerEvents: sha === commit ? "all" : "none",
                top: y ?? "",
                left: x ?? "",
              }}
            >
              {sha.slice(0, 7)}
              <div>{date || ""}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const getMax = (arr: number[]) =>
  arr.reduce((agg, val) => Math.max(agg, val), 0);
const Bars = ({ tree, maxSize }: { tree: Tree; maxSize: number }) => {
  const rowHeight = 20;
  const sortedTree = useMemo(
    () => tree.sort((a, b) => (b?.size || 0) - (a?.size || 0)),
    [tree]
  );

  return (
    <div
      className="relative z-0 p-3 my-5"
      style={{
        height: `calc(${tree.length * rowHeight}px + 2rem)`,
      }}
    >
      {sortedTree.map(({ path, size }, i) => {
        const percent = ((size || 0) * 100) / maxSize;
        return (
          <motion.div
            className="flex w-full items-center absolute min-w-0 left-0 right-0"
            animate={{
              y: i * rowHeight,
            }}
            transition={{
              type: "tween",
              duration: 0.3,
            }}
            key={path}
          >
            <div className="flex-none w-20 max-w-[10%] truncate font-mono text-xs text-right mr-3 text-gray-500 ">
              {((size || 0) / 1000).toFixed(1).toLocaleString()}KB
            </div>
            <div className="flex-none w-72 max-w-[20%] truncate font-mono text-xs mr-2">
              {path}
            </div>
            <div className="flex-[3] relative min-w-0">
              <motion.div
                className="bg-indigo-600 h-4 relative"
                initial={{
                  width: 0,
                }}
                animate={{
                  width: `${percent}%`,
                }}
                transition={{
                  type: "tween",
                  duration: 0.3,
                }}
              >
                {/* <div
                  className={`absolute text-xs text-gray-900 ${
                    percent < 10 ? "left-2" : "right-2"
                  }`}
                >
                  {size?.toLocaleString()}
                </div> */}
              </motion.div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<undefined | (() => void)>();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current && savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
