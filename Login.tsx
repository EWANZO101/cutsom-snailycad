import type { GetServerSideProps } from "next";
import { getTranslations } from "lib/getTranslation";
import { Title } from "components/shared/Title";
import { AuthScreenImages } from "components/auth/auth-screen-images";
import { LocalhostDetector } from "components/auth/localhost-detector";
import { DemoDetector } from "components/auth/demo-detector";
import { parseCookies } from "nookies";
import { VersionDisplay } from "components/shared/VersionDisplay";
import { useAuth } from "context/AuthContext";
import { useTranslations } from "next-intl";
import { LoginForm } from "components/auth/login/login-form";
import { useRouter } from "next/router";
import { requestAll } from "lib/utils";
import { ApiVerification } from "components/auth/api-verification";

interface Props {
  isLocalhost: boolean;
  isCORSError: boolean;
  CORS_ORIGIN_URL: string | null;
  cad: any; // Consider adding proper typing based on your CAD data structure
  userSavedLocale: string | null;
  userSavedIsDarkTheme: string | null;
}

export default function Login(props: Props) {
  const { cad } = useAuth();
  const t = useTranslations("Auth");
  const router = useRouter();

  async function handleSubmit({ from }: { from: string }) {
    await router.push(from);
  }

  return (
    <>
      <Title renderLayoutTitle={false}>{t("login")}</Title>

      <main className="flex flex-col items-center justify-center pt-20">
        <AuthScreenImages />
        <LocalhostDetector isLocalhost={props.isLocalhost} />
        <ApiVerification 
          isCORSError={props.isCORSError} 
          CORS_ORIGIN_URL={props.CORS_ORIGIN_URL} 
        />
        <DemoDetector />

        <LoginForm onFormSubmitted={handleSubmit} />
        <VersionDisplay cad={cad} />

        <div className="mt-6 md:mt-0 relative md:absolute md:bottom-10 md:left-1/2 md:-translate-x-1/2 z-50 max-w-xl w-full text-center px-4">
          <div className="bg-neutral-100 dark:bg-neutral-800 rounded-xl p-4 shadow-md">
            <p className="text-lg font-semibold text-neutral-800 dark:text-gray-200">
              Made by{" "}
              <a
                href="https://snailycad.org"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
              >
                SnailyCAD
              </a>
            </p>
            <p className="mt-2 text-sm text-neutral-700 dark:text-gray-400">
              Please{" "}
              <span className="font-medium text-red-600 dark:text-red-400">
                do not contact SnailyCAD
              </span>{" "}
              for issues like admin permissions, user problems, or Discord connection issues.
              Use our Discord for support instead.
            </p>
            <p className="mt-3 text-base text-neutral-800 dark:text-gray-300">
              For support, contact <span className="font-semibold">Calirp</span> on{" "}
              <a
                href="https://discord.gg/mPvrQH28T3"
                target="_blank"
                rel="noreferrer"
                className="underline text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Discord
              </a>{" "}
              and open a ticket.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ locale, req }) => {
  const cookies = parseCookies({ req });
  const userSavedLocale = cookies.sn_locale ?? null;
  const userSavedIsDarkTheme = cookies.sn_isDarkTheme ?? null;

  const [data] = await requestAll(req, [["/admin/manage/cad-settings", null]]);

  const CORS_ORIGIN_URL = process.env.CORS_ORIGIN_URL ?? null;
  const NEXT_PUBLIC_CLIENT_URL = process.env.NEXT_PUBLIC_CLIENT_URL ?? null;

  const isWildcard = CORS_ORIGIN_URL?.includes("*") ?? false;
  const isLocalhost =
    (CORS_ORIGIN_URL?.includes("localhost") || NEXT_PUBLIC_CLIENT_URL?.includes("localhost")) ??
    false;

  // Fixed typo: was "isDefaultENvValue", now "isDefaultEnvValue"
  const isDefaultEnvValue = CORS_ORIGIN_URL === "http://192.168.x.x:3000";
  const doURLsMatch = isWildcard
    ? true
    : CORS_ORIGIN_URL === NEXT_PUBLIC_CLIENT_URL && !isDefaultEnvValue;

  return {
    props: {
      isLocalhost,
      isCORSError: !doURLsMatch,
      CORS_ORIGIN_URL,
      cad: data,
      userSavedLocale,
      userSavedIsDarkTheme,
      messages: await getTranslations(["auth"], userSavedLocale ?? locale),
    },
  };
};
