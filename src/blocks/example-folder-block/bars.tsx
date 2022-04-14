import { motion } from "framer-motion";
import { useMemo } from "react";
import { Tree } from ".";

export const Bars = ({ tree, maxSize }: { tree: Tree; maxSize: number }) => {
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
              ></motion.div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
