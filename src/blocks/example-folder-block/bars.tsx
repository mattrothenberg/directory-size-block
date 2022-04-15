import { ArrowDownLeftIcon, ArrowUpRightIcon } from "@primer/octicons-react";
import { motion, LayoutGroup } from "framer-motion";
import { useMemo } from "react";
import fileSize from "filesize";
import { Tree } from ".";

export const Bars = ({
  tree,
  maxSize,
  beforeTree,
}: {
  tree: Tree;
  beforeTree?: Tree;
  maxSize: number;
}) => {
  const sortedTree = useMemo(
    () => tree.sort((a, b) => (b?.size || 0) - (a?.size || 0)),
    [tree]
  );

  return (
    <LayoutGroup>
      <div className="relative z-0 px-4 pb-4 space-y-1 mt-6">
        {sortedTree.map(({ path, size, sha }) => {
          const percent = ((size || 0) * 100) / maxSize;
          const beforeSize = beforeTree?.find((d) => d.path === path)?.size;
          const increased =
            typeof size !== "undefined" &&
            Boolean(beforeSize && beforeSize < size);
          const decreased =
            typeof size !== "undefined" &&
            Boolean(beforeSize && beforeSize > size);

          const pathUrl = ``;

          return (
            <motion.div
              layout="position"
              layoutId={path}
              className="grid grid-cols-[100px_30px_240px_1fr] gap-2"
              key={path}
            >
              <div className="text-right text-gray-600">
                <span className="font-mono text-xs">{fileSize(size || 0)}</span>
              </div>
              <div className="text-center">
                <span>
                  {increased && <ArrowUpRightIcon className="text-green-600" />}
                  {decreased && <ArrowDownLeftIcon className="text-red-600" />}
                </span>
              </div>
              <div className="truncate text-gray-600">
                <a href={pathUrl}>
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
