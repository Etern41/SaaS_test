"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FolderKanban } from "lucide-react";

interface ProjectMember {
  id: string;
  role: string;
  user: { id: string; name: string; email: string };
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  owner: { id: string; name: string; email: string };
  members: ProjectMember[];
  _count: { tasks: number };
}

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="transition-shadow hover:shadow-md cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{project.name}</CardTitle>
            </div>
            <Badge variant="secondary">
              {project._count.tasks} {getTaskWord(project._count.tasks)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {project.description && (
            <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
              {project.description}
            </p>
          )}
          <div className="flex items-center gap-1">
            {project.members.slice(0, 5).map((member) => (
              <Avatar key={member.id} className="h-7 w-7 border-2 border-background">
                <AvatarFallback className="text-[10px]">
                  {member.user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            {project.members.length > 5 && (
              <span className="ml-1 text-xs text-muted-foreground">
                +{project.members.length - 5}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function getTaskWord(count: number): string {
  if (count % 10 === 1 && count % 100 !== 11) return "задача";
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100))
    return "задачи";
  return "задач";
}
