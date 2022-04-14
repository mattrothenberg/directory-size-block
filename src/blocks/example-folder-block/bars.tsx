import { ArrowDownLeftIcon, ArrowUpRightIcon } from "@primer/octicons-react";
import { motion, LayoutGroup } from "framer-motion";
import { useMemo } from "react";
import { Tree } from ".";

const formatSize = (size?: number) => {
  return ((size || 0) / 1000).toFixed(1).toLocaleString() + "kb";
};

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
      <div className="relative z-0 p-4 space-y-1 mt-6">
        {sortedTree.map(({ path, size }) => {
          const percent = ((size || 0) * 100) / maxSize;
          const beforeSize = beforeTree?.find((d) => d.path === path)?.size;
          const increased =
            typeof size !== "undefined" && beforeSize && beforeSize < size;
          const decreased =
            typeof size !== "undefined" && beforeSize && beforeSize > size;

          return (
            <motion.div
              layout="position"
              layoutId={path}
              className="flex w-full items-center"
              key={path}
            >
              <div className="flex-none w-16 max-w-[15%] truncate font-mono text-xs text-right mr-3 text-gray-500 flex items-center relative gap-1">
                {formatSize(size)}
                {increased && <ArrowUpRightIcon className="text-green-600" />}
                {decreased && <ArrowDownLeftIcon className="text-red-600" />}
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
                ></motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </LayoutGroup>
  );
};
