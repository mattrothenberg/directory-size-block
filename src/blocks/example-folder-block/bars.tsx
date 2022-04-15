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
      <div className="relative z-0 px-4 pb-4 space-y-1 mt-6">
        {sortedTree.map(({ path, size }) => {
          const percent = ((size || 0) * 100) / maxSize;
          const beforeSize = beforeTree?.find((d) => d.path === path)?.size;
          const increased =
            typeof size !== "undefined" &&
            Boolean(beforeSize && beforeSize < size);
          const decreased =
            typeof size !== "undefined" &&
            Boolean(beforeSize && beforeSize > size);

          return (
            <motion.div
              layout="position"
              layoutId={path}
              className="grid grid-cols-[100px_30px_240px_1fr] gap-2"
              key={path}
            >
              <div className="text-right text-gray-600">
                <span className="font-mono text-xs">{formatSize(size)}</span>
              </div>
              <div className="text-center">
                <span>
                  {increased && <ArrowUpRightIcon className="text-green-600" />}
                  {decreased && <ArrowDownLeftIcon className="text-red-600" />}
                </span>
              </div>
              <div className="truncate text-gray-600">
                <span className="font-mono text-xs">{path}</span>
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
              {/* <motion.div className="flex-none truncate font-mono text-xs text-right text-gray-500">
                {formatSize(size)}
              </motion.div>
              <motion.div className="w-4 flex-shrink-0">
                {increased && <ArrowUpRightIcon className="text-green-600" />}
                {decreased && <ArrowDownLeftIcon className="text-red-600" />}
              </motion.div>
              <motion.div className="flex-none truncate font-mono text-xs mr-2">
                {path}
              </motion.div>
              <motion.div className="flex-1 relative min-w-0">
                <motion.div
                  className="bg-indigo-600 h-4 relative"
                  initial={{
                    width: 0,
                  }}
                  animate={{
                    width: `${percent}%`,
                  }}
                ></motion.div>
              </motion.div> */}
            </motion.div>
          );
        })}
      </div>
    </LayoutGroup>
  );
};
