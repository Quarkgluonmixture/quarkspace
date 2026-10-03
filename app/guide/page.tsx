import type { Metadata } from "next";
import styles from "./guide.module.css";

export const metadata: Metadata = {
  title: "八达岭红叶岭实时导航 — QuarkSpace",
  description: "八达岭国家森林公园红叶岭手机步行导航：GPS 定位、路线选择、步道岔口方向提示与官方导览图核对。",
  alternates: { canonical: "https://www.quarkspace.top/guide" },
};

export default function GuidePage() {
  return (
    <main className={styles.shell}>
      <iframe
        className={styles.frame}
        src="/badaling-redleaf-nav.html"
        title="八达岭红叶岭实时步行导航"
        allow="geolocation"
      />
      <noscript>
        <p className={styles.noScript}>这个导航页需要 JavaScript 才能使用地图与定位。</p>
      </noscript>
    </main>
  );
}
