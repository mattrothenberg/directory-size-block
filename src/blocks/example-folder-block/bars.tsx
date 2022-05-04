import { ArrowDownLeftIcon, ArrowUpRightIcon } from "@primer/octicons-react";
import { Label } from "@primer/react";
import fileSize from "filesize";
import { animate, LayoutGroup, motion } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";
import { tw } from "twind";
import { Tree } from ".";

type Delta = "increase" | "decrease" | "same" | "new";

function Counter({ from, to }: { from: number; to: number }) {
  const nodeRef = useRef<HTMLParagraphElement>(null!);

  useEffect(() => {
    const node = nodeRef.current;

    const controls = animate(from, to, {
      duration: 0.35,
      onUpdate(value) {
        node.textContent = fileSize(value);
      },
    });

    return () => controls.stop();
  }, [from, to]);

  return <p className={tw`text-right font-mono text-xs`} ref={nodeRef} />;
}

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
      <div className={tw`relative z-0 px-4 pb-4 space-y-1 mt-6`}>
        {sortedTree.map(({ path, sha, size }) => {
          const percent = ((size || 0) * 100) / maxSize;
          let beforePath = beforeTree?.find((d) => d.path === path);

          const getDelta = (): Delta => {
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
              className={tw`grid gap-2`}
              style={{
                gridTemplateColumns: "100px 40px 240px 1fr",
              }}
              key={path}
            >
              <div className={tw`flex items-center justify-end`}>
                {/* @ts-ignore */}
                <Counter from={beforePath?.size} to={size} />
              </div>
              <div className={tw`text-center`}>
                {beforeTree ? (
                  <span>
                    {delta === "increase" && (
                      <ArrowUpRightIcon className={tw`text-green-600`} />
                    )}
                    {delta === "new" && (
                      <Label
                        className={tw`transform scale-90`}
                        variant="accent"
                      >
                        New
                      </Label>
                    )}
                    {delta === "decrease" && (
                      <ArrowDownLeftIcon className={tw`text-red-600`} />
                    )}
                  </span>
                ) : null}
              </div>
              <div className={tw`truncate text-gray-600`}>
                <a
                  className={tw`hover:underline !text-gray-600`}
                  target="_blank"
                  href={pathUrl}
                >
                  <span className={tw`font-mono text-xs`}>{path}</span>
                </a>
              </div>
              <div>
                <motion.div
                  layout="position"
                  className={tw`bg-indigo-600 h-4 relative`}
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
