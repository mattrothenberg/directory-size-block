import { arrow } from "@floating-ui/core";
import { offset, shift, useFloating } from "@floating-ui/react-dom";
import { useRef, useState } from "react";
import { CommitWithData } from ".";
import { useInterval } from "./hooks";

export const Timeline = ({
  commit,
  setCommit,
  commits,
}: {
  commit: string | null;
  setCommit: (commit: string | null) => void;
  commits: CommitWithData[];
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
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
