import { Link } from "react-router-dom";
import { Empty, btnCls } from "../components/ui";
import { useT } from "../i18n/useT";

export default function NotFound() {
  const { t } = useT();

  return (
    <div className="space-y-4">
      <Empty title={t("notFound.title")} text={t("notFound.text")} />
      <Link to="/" className={`${btnCls} inline-flex`}>
        {t("notFound.back")}
      </Link>
    </div>
  );
}
