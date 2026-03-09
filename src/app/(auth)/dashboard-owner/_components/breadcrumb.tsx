"use client";

import { Fragment, useEffect, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const formatSegment = (segment: string) => {
  const processed = segment.replace(/-/g, " ").replace(/_/g, " ");
  return processed.charAt(0).toUpperCase() + processed.slice(1);
};

export function DynamicBreadcrumb() {
  const [pathname, setPathname] = useState("/");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPathname(window.location.pathname);
    }
  }, []);
  const segments = (pathname || "/").split("/").filter(Boolean);

  let currentPath = "";

  return (
    <Breadcrumb className="hidden md:block">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
        </BreadcrumbItem>
        {segments.map((segment, index) => {
          currentPath += `/${segment}`;
          const isLast = index === segments.length - 1;
          const formattedName = formatSegment(segment);
          return (
            <Fragment key={segment}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{formattedName}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={currentPath}>
                    {formattedName}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
