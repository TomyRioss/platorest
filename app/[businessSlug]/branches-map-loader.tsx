"use client";

import dynamic from "next/dynamic";

const BranchesMap = dynamic(() => import("./branches-map").then((m) => m.BranchesMap), { ssr: false });

export { BranchesMap as BranchesMapLoader };
