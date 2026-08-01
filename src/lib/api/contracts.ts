import { applicationApiContract } from "@/features/applications/api/application-api";
import { authApiContract } from "@/features/auth/api/auth-api";
import { calendarApiContract } from "@/features/calendar/api/calendar-api";
import { essayApiContract } from "@/features/essays/api/essay-api";
import { credentialApiContract } from "@/features/materials/api/credential-api";
import { externalLinkApiContract } from "@/features/materials/api/external-link-api";
import { fileApiContract } from "@/features/materials/api/file-api";

export const apiModuleContracts = [
  authApiContract,
  applicationApiContract,
  essayApiContract,
  credentialApiContract,
  fileApiContract,
  externalLinkApiContract,
  calendarApiContract,
];
