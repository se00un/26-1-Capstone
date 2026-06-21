import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { generateTripReport, getTripReport } from "../api/reportAPI";
import "./ReportPage.css";

type RecommendedDestination = {
  destination?: string;
  country?: string;
  is_overseas?: boolean;
  reason?: string;
};

type ReportData = {
  id?: number;
  trip_id?: number;
  report_text?: string;
  summary_json?: {
    trip_summary?: string;
    spending_analysis?: string;
    trip_vibe?: string;
    highlight_places?: string;
    next_style?: string;
    [key: string]: any;
  };
  recommendation_text?: string;
  recommended_destinations_json?: RecommendedDestination[];
  created_at?: string;
};

const getSummaryValue = (
  report: ReportData | null,
  key: string,
  fallback = "아직 생성된 내용이 없습니다."
) => {
  if (!report?.summary_json) return fallback;
  return report.summary_json[key] || fallback;
};

export default function ReportPage() {
  const navigate = useNavigate();
  const { tripId } = useParams();

  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const recommendations = useMemo(
    () => report?.recommended_destinations_json || [],
    [report]
  );

  const loadReport = async () => {
    try {
      if (!tripId) return;

      setLoading(true);
      setErrorMessage("");

      const data = await getTripReport(tripId);
      setReport(data);
    } catch (error) {
      console.error("리포트 조회 실패:", error);
      setReport(null);
      setErrorMessage("아직 생성된 리포트가 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      if (!tripId) return;

      setGenerating(true);
      setErrorMessage("");

      const data = await generateTripReport(tripId);
      setReport(data);
    } catch (error) {
      console.error("리포트 생성 실패:", error);
      alert(
        "리포트 생성에 실패했습니다. 이미 생성된 리포트가 있거나 데이터가 부족할 수 있습니다."
      );
      loadReport();
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [tripId]);

  return (
    <div className="app-container">
      <div className="report-page">
        <header className="report-header">
          <button
            className="back-btn"
            onClick={() => navigate(`/trips/${tripId}`)}
          >
            ✕
          </button>
          <h1>여행 리포트</h1>
        </header>

        <div className="report-scroll-area">
          {loading ? (
            <div className="report-empty">
              <p>리포트를 불러오는 중입니다...</p>
            </div>
          ) : !report ? (
            <div className="report-empty">
              <p>{errorMessage || "아직 생성된 리포트가 없습니다."}</p>
              <button
                className="generate-report-btn"
                onClick={handleGenerateReport}
                disabled={generating}
              >
                {generating ? "AI 리포트 생성 중..." : "AI 리포트 생성하기"}
              </button>
            </div>
          ) : (
            <main className="report-content">
              <section className="report-title-card">
                  <h2>이번 여행은 어땠나요?</h2>

                <button
                  className="small-refresh-btn"
                  onClick={loadReport}
                  disabled={loading}
                >
                  새로고침
                </button>
              </section>

              <section className="report-card">
                <h3>여행 요약</h3>
                <p>{getSummaryValue(report, "trip_summary")}</p>
              </section>

              <section className="report-card">
                <h3>소비 분석</h3>
                <p>{getSummaryValue(report, "spending_analysis")}</p>
              </section>

              <section className="report-card">
                <h3>여행 분위기</h3>
                <p>{getSummaryValue(report, "trip_vibe")}</p>
              </section>

              <section className="report-card">
                <h3>하이라이트 장소</h3>
                <p>{getSummaryValue(report, "highlight_places")}</p>
              </section>

              <section className="report-card">
                <h3>다음 여행 스타일</h3>
                <p>{getSummaryValue(report, "next_style")}</p>
              </section>

              <section className="report-card recommendation-card">
                <h3>추천 여행지</h3>

                {/* {report.recommendation_text && (
                  <p className="recommendation-summary">
                    {report.recommendation_text}
                  </p>
                )} */}

                {recommendations.length > 0 ? (
                  <div className="destination-list">
                    {recommendations.map((item, index) => (
                      <div
                        className="destination-item"
                        key={`${item.destination}-${index}`}
                      >
                        <div className="destination-rank">{index + 1}</div>
                        <div className="destination-text">
                          <strong>
                            {item.destination || "추천 여행지"}{" "}
                            {item.country ? `(${item.country})` : ""}
                          </strong>
                          <p>{item.reason || "추천 이유가 없습니다."}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>추천 여행지가 아직 없습니다.</p>
                )}
              </section>
            </main>
          )}
        </div>

        <nav className="bottom-tab">
          <button onClick={() => navigate(`/trips/${tripId}`)}>일정</button>
          <button onClick={() => navigate(`/trips/${tripId}/budget`)}>
            예산
          </button>
          <button onClick={() => navigate(`/trips/${tripId}/friends`)}>
            친구
          </button>
          <button className="active-tab">리포트</button>
        </nav>
      </div>
    </div>
  );
}