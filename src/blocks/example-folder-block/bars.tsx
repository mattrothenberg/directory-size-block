import { ArrowDownLeftIcon, ArrowUpRightIcon } from "@primer/octicons-react";
import fileSize from "filesize";
import { LayoutGroup, motion } from "framer-motion";
import { useMemo } from "react";
import { Tree } from ".";

type Delta = "increase" | "decrease" | "same" | "new";

export const Bars = ({
  tree,
  maxSize,
  beforeTree,
  owner,
  repo,
  commit,
}: {
  tree: Tree;
  beforeTree?: Tree;
  maxSize: number;
  owner: string;
  repo: string;
  commit: string | null;
}) => {
  const sortedTree = useMemo(
    () => tree.sort((a, b) => (b?.size || 0) - (a?.size || 0)),
    [tree]
  );

  return (
    <LayoutGroup>
      <div className="relative z-0 px-4 pb-4 space-y-1 mt-6">
        {sortedTree.map(({ path, sha, size }) => {
          const percent = ((size || 0) * 100) / maxSize;

          const getDelta = (): Delta => {
            let beforePath = beforeTree?.find((d) => d.path === path);
            if (!beforePath) return "new";
            if (!size) return "same";
            if (!beforePath.size) return "same";
            return beforePath?.size === size
              ? "same"
              : size > beforePath.size
              ? "increase"
              : "decrease";
          };

          const pathUrl = `https://github.com/${owner}/${repo}/commit/${commit}`;
          let delta = getDelta();

          return (
            <motion.div
              layout="position"
              layoutId={path}
              className="grid grid-cols-[100px_40px_240px_1fr] gap-2"
              key={path}
            >
              <div className="text-right text-gray-600">
                <span className="font-mono text-xs">{fileSize(size || 0)}</span>
              </div>
              <div className="text-center">
                {beforeTree ? (
                  <span>
                    {delta === "increase" && (
                      <ArrowUpRightIcon className="text-green-600" />
                    )}
                    {delta === "new" && (
                      <span className="Label Label--accent transform scale-90">
                        New
                      </span>
                    )}
                    {delta === "decrease" && (
                      <ArrowDownLeftIcon className="text-red-600" />
                    )}
                  </span>
                ) : null}
              </div>
              <div className="truncate text-gray-600">
                <a className="hover:underline" target="_blank" href={pathUrl}>
                  <span className="font-mono text-xs">{path}</span>
                </a>
              </div>
              <div>
                <motion.div
                  layout="position"
                  className="bg-indigo-600 h-4 relative"
                  initial={{
                    width: 0,
                  }}
                  animate={{
                    width: `${percent}%`,
                  }}
                ></motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </LayoutGroup>
  );
};
