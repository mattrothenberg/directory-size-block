import { useState } from "react";
import { Range } from "react-range";
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

  let values = [commits.findIndex((d) => d.sha === commit)];

  return (
    <div className="w-full p-3 border-b flex items-center gap-3">
      <button
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
              fillRule="evenodd"
              d="M12 2.5a9.5 9.5 0 100 19 9.5 9.5 0 000-19zM1 12C1 5.925 5.925 1 12 1s11 4.925 11 11-4.925 11-11 11S1 18.075 1 12z"
            ></path>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M9.5 15.584V8.416a.5.5 0 01.77-.42l5.576 3.583a.5.5 0 010 .842l-5.576 3.584a.5.5 0 01-.77-.42z"></path>
            <path
              fillRule="evenodd"
              d="M12 2.5a9.5 9.5 0 100 19 9.5 9.5 0 000-19zM1 12C1 5.925 5.925 1 12 1s11 4.925 11 11-4.925 11-11 11S1 18.075 1 12z"
            ></path>
          </svg>
        )}
      </button>
      <div className="flex-1 flex items-center">
        <Range
          step={1}
          min={0}
          max={commits.length - 1}
          values={values}
          onChange={(values) => {
            if (isPlaying) {
              setIsPlaying(false);
            }

            setCommit(commits[values[0]].sha);
          }}
          renderMark={({ props, index }) => (
            <div
              {...props}
              className="w-[2px] h-3"
              style={{
                ...props.style,
                backgroundColor: index * 1 < values[0] ? "black" : "#ccc",
              }}
            />
          )}
          renderTrack={({ props, children }) => (
            <div
              {...props}
              className="bg-gray-200 h-1 w-full"
              style={{
                ...props.style,
              }}
            >
              {children}
            </div>
          )}
          renderThumb={({ props }) => (
            <div
              {...props}
              className="w-4 h-4 rounded-full bg-black flex items-center justify-center relative"
              style={{
                ...props.style,
              }}
            >
              <div className="absolute -top-3 w-2 h-2 bg-black transform rotate-45"></div>
              <div className="bg-black absolute -top-8 text-white p-1 text-xs">
                <span className="font-mono">
                  {commits[values[0]].sha.slice(0, 7)}
                </span>
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
};
