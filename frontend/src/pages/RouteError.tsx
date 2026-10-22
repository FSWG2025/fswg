import {
  isRouteErrorResponse,
  Link,
  useNavigate,
  useRouteError,
} from "react-router";
import { ArrowLeft, Home, RefreshCw } from "lucide-react";
import SEO from "@/components/SEO";

function getErrorDetails(error: unknown) {
  if (error == null) {
    return {
      status: 404,
      title: "Page not found",
      message: "That link doesn’t exist or may be outdated.",
      kind: "not-found" as const,
    };
  }

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return {
        status: 404,
        title: "Page not found",
        message: "That link doesn’t exist or may be outdated.",
        kind: "not-found" as const,
      };
    }
    return {
      status: error.status,
      title: error.statusText || "Something went wrong",
      message:
        typeof error.data === "string" && error.data.trim()
          ? error.data
          : "We couldn’t load this page. Try again or head home.",
      kind: "http" as const,
    };
  }

  if (error instanceof Error) {
    return {
      status: 500,
      title: "Something went wrong",
      message: "An unexpected error interrupted this page.",
      kind: "unexpected" as const,
      detail: process.env.NODE_ENV !== "production" ? error.message : undefined,
    };
  }

  return {
    status: 500,
    title: "Something went wrong",
    message: "An unexpected error interrupted this page.",
    kind: "unexpected" as const,
  };
}

const RouteError = () => {
  const error = useRouteError();
  const navigate = useNavigate();
  const details = getErrorDetails(error);
  const is404 = details.kind === "not-found";

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-[#E4EFF8] px-4 py-16 font-sans">
      <SEO
        title={is404 ? "Page Not Found" : "Something Went Wrong"}
        description={details.message}
      />

      <div className="w-full max-w-md rounded-[24px] bg-white px-6 py-8 text-center shadow-[0_12px_40px_rgba(18,33,62,0.08)] sm:px-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C69259]">
          {details.status}
        </p>
        <h1 className="mt-2 text-xl font-bold tracking-tight text-[#12213E] sm:text-2xl">
          {details.title}
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[#6B7280]">
          {details.message}
        </p>

        {details.detail && (
          <p className="mt-3 break-words rounded-xl bg-[#F7FBFE] px-3 py-2 font-mono text-left text-[11px] text-[#12213E]">
            {details.detail}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#12213E]/12 px-4 py-2.5 text-sm font-semibold text-[#12213E] transition hover:bg-[#F7FBFE]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
          {!is404 && (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#12213E]/12 px-4 py-2.5 text-sm font-semibold text-[#12213E] transition hover:bg-[#F7FBFE]"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          )}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#12213E] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0D1A2E]"
          >
            <Home className="h-3.5 w-3.5" />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RouteError;
