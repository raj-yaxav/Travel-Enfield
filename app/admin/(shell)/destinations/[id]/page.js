"use client";

import { useParams } from "next/navigation";
import ResourceEditPage from "../../../../../components/admin/ResourceEditPage";

export default function Page() {
  const { id } = useParams();
  return <ResourceEditPage resourceKey="destinations" id={id} />;
}
