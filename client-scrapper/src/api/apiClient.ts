import { CasesResponse, CaseResponse, ApiError } from "@/types/case";

// Base API URL - should be set in environment variables in production
const API_URL = import.meta.env.VITE_API_URL || "/api";

/**
 * Function to handle API responses and extract data or errors
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: ApiError = {
      message: errorData.message || "An error occurred",
      status: response.status,
    };
    throw error;
  }

  return response.json() as Promise<T>;
}

/**
 * Get token from Auth0
 */
function getAuthHeader(): HeadersInit {
  // In a real app, this would get the token from Auth0
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Get all cases with optional pagination and filtering
 */
export async function getCases(
  page = 1,
  limit = 10,
  search?: string,
  startFiled?: string,
  endFiled?: string,
  startUpdated?: string,
  endUpdated?: string
) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.append("search", search);
  if (startFiled) params.append("startFiled", startFiled);
  if (endFiled) params.append("endFiled", endFiled);
  if (startUpdated) params.append("startUpdated", startUpdated);
  if (endUpdated) params.append("endUpdated", endUpdated);

  const resp = await fetch(`${API_URL}/cases?${params}`, {
    headers: getAuthHeader(),
    credentials: "include",
  });
  return handleResponse<CasesResponse>(resp);
}

/**
 * Get a single case by case number
 */
export async function getCase(caseNumber: string): Promise<CaseResponse> {
  const response = await fetch(
    `${API_URL}/case/${encodeURIComponent(caseNumber)}`,
    {
      headers: {
        ...getAuthHeader(),
      },
      credentials: "include",
    }
  );

  return handleResponse<CaseResponse>(response);
}

/**
 * Delete a case
 */
export async function deleteCase(
  caseNumber: string,
  deleteFile = false
): Promise<{ success: boolean }> {
  const params = new URLSearchParams();
  if (deleteFile) {
    params.append("deleteFile", "true");
  }

  const response = await fetch(
    `${API_URL}/case/${encodeURIComponent(caseNumber)}?${params.toString()}`,
    {
      method: "DELETE",
      headers: {
        ...getAuthHeader(),
      },
      credentials: "include",
    }
  );

  return handleResponse<{ success: boolean }>(response);
}

export async function downloadCasesCsv(
  startUpdated?: string,
  endUpdated?: string
) {
  const params = new URLSearchParams();
  if (startUpdated) params.append("startUpdated", startUpdated);
  if (endUpdated) params.append("endUpdated", endUpdated);

  const res = await fetch(`${API_URL}/cases/export?${params}`, {
    method: "GET",
    headers: getAuthHeader(),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to export CSV");

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);

  // Build the filename the same way the backend does
  let filename: string;
  if (startUpdated && endUpdated) {
    filename = `cases_${startUpdated}_to_${endUpdated}.csv`;
  } else if (startUpdated) {
    filename = `cases_from_${startUpdated}.csv`;
  } else if (endUpdated) {
    filename = `cases_to_${endUpdated}.csv`;
  } else {
    filename = `cases_all.csv`;
  }

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
