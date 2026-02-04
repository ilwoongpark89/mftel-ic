"use client";

import { motion } from "framer-motion";
import {
  Wind,
  Fan,
  Droplets,
  Thermometer,
  Zap,
  Cpu,
  Activity,
  Calculator,
  Leaf,
  Factory,
  TrendingUp,
  Info,
  BookOpen,
  Target,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Scale,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BlockFormula, InlineFormula } from "@/components/ui/math";

// ============================================================================
// COMPONENTS
// ============================================================================

function SectionCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "p-6 rounded-2xl bg-card border border-border/50 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

function FormulaBox({
  formula,
  description,
  variables,
}: {
  formula: string;
  description: string;
  variables?: { symbol: string; meaning: string; unit?: string }[];
}) {
  return (
    <div className="my-4 p-4 rounded-xl bg-muted/50 border border-border/50">
      <div className="text-center mb-2 overflow-x-auto">
        <BlockFormula>{formula}</BlockFormula>
      </div>
      {description && (
        <p className="text-sm text-muted-foreground text-center mb-3">
          {description}
        </p>
      )}
      {variables && variables.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {variables.map((v) => (
            <div key={v.symbol} className="flex items-center gap-2">
              <span className="text-primary"><InlineFormula>{v.symbol}</InlineFormula></span>
              <span className="text-muted-foreground">
                : {v.meaning}
                {v.unit && <span className="text-primary ml-1">[{v.unit}]</span>}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function KeyPoint({
  children,
  variant = "info",
}: {
  children: React.ReactNode;
  variant?: "info" | "success" | "warning";
}) {
  const colors = {
    info: "bg-blue-500/10 border-blue-500/30 text-blue-500",
    success: "bg-emerald-500/10 border-emerald-500/30 text-emerald-500",
    warning: "bg-amber-500/10 border-amber-500/30 text-amber-500",
  };

  return (
    <div className={cn("p-4 rounded-lg border", colors[variant])}>
      <div className="flex items-start gap-3">
        <Info className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function IntroductionPage() {
  return (
    <AppShell showFooter={false}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* ================================================================== */}
        {/* HERO SECTION */}
        {/* ================================================================== */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <BookOpen className="h-4 w-4" />
            Cooling Technology Guide
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            전자기기 냉각 기술의 이해
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            공랭(Air Cooling)부터 수냉(Cold Plate), 침수냉각(Immersion Cooling)까지
            <br />
            각 냉각 기술의 원리, 특성, 계산 방법을 상세히 알아봅니다.
          </p>
        </motion.section>

        {/* ================================================================== */}
        {/* DATA CENTER ENERGY CRISIS */}
        {/* ================================================================== */}
        <motion.section
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mb-16"
        >
          <motion.div variants={fadeInUp} className="mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-red-500/10">
                <Factory className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">데이터센터와 에너지 위기</h2>
                <p className="text-muted-foreground">AI 시대, 전력 소비의 급격한 증가</p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-6">
            <motion.div variants={fadeInUp}>
              <SectionCard className="border-red-500/20">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-red-500" />
                  2030년, 데이터센터 전력 소비 2배 증가 전망
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-muted-foreground mb-4">
                      국제에너지기구(IEA)에 따르면, 전 세계 데이터센터의 전력 소비량은
                      <strong className="text-red-500"> 2030년까지 945 TWh</strong>에 달할 것으로 전망됩니다.
                      이는 2024년 415 TWh의 <strong>2배 이상</strong>이며,
                      현재 일본 전체의 연간 전력 소비량과 맞먹는 수준입니다.
                    </p>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-muted/30">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">2024년</span>
                          <span className="text-sm font-bold">415 TWh</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full w-[44%] bg-blue-500 rounded-full" />
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">2030년 (전망)</span>
                          <span className="text-sm font-bold text-red-500">945 TWh</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full w-full bg-red-500 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">주요 증가 요인</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 font-bold">•</span>
                        <span><strong>AI 연산 수요 폭증:</strong> AI 최적화 데이터센터의 전력 수요는 2030년까지 4배 이상 증가 예상</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 font-bold">•</span>
                        <span><strong>미국의 급격한 증가:</strong> 미국 내 데이터센터 전력 소비 130% 증가 (240 TWh 추가)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 font-bold">•</span>
                        <span><strong>선진국 전력 수요 성장의 20%:</strong> 2030년까지 선진국 전력 수요 증가분의 1/5이 데이터센터</span>
                      </li>
                    </ul>
                    <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
                      <span className="text-amber-600 dark:text-amber-400">
                        출처: IEA &ldquo;Energy and AI&rdquo; Report (2025)
                      </span>
                    </div>
                  </div>
                </div>
              </SectionCard>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <SectionCard className="border-red-500/20">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-orange-500" />
                  냉각이 데이터센터 전력의 30~40%를 차지
                </h3>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 text-center">
                    <div className="text-3xl font-bold text-blue-500 mb-1">~50%</div>
                    <div className="text-xs text-muted-foreground">IT 장비 전력</div>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 text-center">
                    <div className="text-3xl font-bold text-orange-500 mb-1">30~40%</div>
                    <div className="text-xs text-muted-foreground">냉각 시스템 전력</div>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-gray-500/10 to-gray-500/5 border border-gray-500/20 text-center">
                    <div className="text-3xl font-bold text-gray-500 mb-1">10~20%</div>
                    <div className="text-xs text-muted-foreground">전력 변환/기타</div>
                  </div>
                </div>
                <KeyPoint variant="warning">
                  <strong>공랭 시스템의 비효율:</strong> 전통적인 공랭 데이터센터의 평균 PUE는 1.55로,
                  IT 장비가 사용하는 전력의 55%가 추가로 냉각과 인프라에 소비됩니다.
                  이는 연간 수백억 원의 전기 요금과 막대한 탄소 배출로 이어집니다.
                </KeyPoint>
                <p className="text-sm text-muted-foreground mt-4">
                  AI 워크로드의 랙당 전력 밀도는 기존 5~10kW에서 <strong>40~100kW 이상</strong>으로 급증하고 있으며,
                  최신 NVIDIA Blackwell Ultra NVL72 랙은 <strong>140kW</strong>에 달합니다.
                  이러한 고밀도 환경에서 공랭은 물리적 한계에 도달했습니다.
                </p>
              </SectionCard>
            </motion.div>
          </div>
        </motion.section>

        {/* ================================================================== */}
        {/* OVERVIEW: WHY COOLING MATTERS */}
        {/* ================================================================== */}
        <motion.section
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mb-16"
        >
          <motion.div variants={fadeInUp} className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">반도체 발열과 냉각의 핵심</h2>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <SectionCard>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold text-lg mb-4">
                    AI 가속기의 발열량 급증
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    무어의 법칙에 따른 집적도 증가와 AI/HPC 연산 수요 폭증으로
                    반도체 칩의 발열량(TDP)은 급격히 증가하고 있습니다.
                    최신 AI 가속기는 단일 칩에서 <strong>700W~1000W 이상</strong>의
                    열을 발생시키며, 이를 효과적으로 제거하지 못하면 성능 저하(Thermal Throttling)와
                    수명 단축이 발생합니다.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <Cpu className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="text-sm font-medium">Intel Core i9 (2024)</div>
                        <div className="text-xs text-muted-foreground">TDP 253W, 칩 면적 257mm²</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <Activity className="h-5 w-5 text-green-500" />
                      <div>
                        <div className="text-sm font-medium">NVIDIA H100 GPU (2023)</div>
                        <div className="text-xs text-muted-foreground">TDP 700W, 칩 면적 814mm²</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                      <Zap className="h-5 w-5 text-amber-500" />
                      <div>
                        <div className="text-sm font-medium">NVIDIA Blackwell B200 (2024)</div>
                        <div className="text-xs text-muted-foreground">TDP 1000W+, 액체냉각 필수</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-4">
                    냉각 성능의 핵심 지표
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-primary mb-2">Heat Flux (열유속)</h4>
                      <FormulaBox
                        formula="q'' = \frac{Q}{A} \quad \left[\frac{\text{W}}{\text{cm}^2}\right]"
                        description="단위 면적당 열 전달량"
                        variables={[
                          { symbol: "Q", meaning: "발열량", unit: "W" },
                          { symbol: "A", meaning: "열 전달 면적", unit: "cm²" },
                        ]}
                      />
                      <p className="text-sm text-muted-foreground">
                        Heat Flux가 높을수록 냉각이 어렵습니다.
                        공랭의 한계는 약 30 W/cm², 수냉은 100 W/cm²,
                        침수냉각은 200+ W/cm²까지 처리 가능합니다.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-primary mb-2">Junction Temperature (접합 온도)</h4>
                      <FormulaBox
                        formula="T_j = T_{ambient} + Q \cdot R_{th}"
                        description="칩 내부 최고 온도"
                        variables={[
                          { symbol: "T_j", meaning: "접합(정션) 온도", unit: "°C" },
                          { symbol: "T_{ambient}", meaning: "주변(냉매) 온도", unit: "°C" },
                          { symbol: "R_{th}", meaning: "열저항", unit: "K/W" },
                        ]}
                      />
                      <p className="text-sm text-muted-foreground">
                        대부분의 반도체는 <InlineFormula>{"T_{j,max}"}</InlineFormula> 85~105°C를 넘지 않아야 합니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>
          </motion.div>
        </motion.section>

        {/* ================================================================== */}
        {/* AIR COOLING */}
        {/* ================================================================== */}
        <motion.section
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mb-16"
        >
          <motion.div variants={fadeInUp} className="mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-orange-500/10">
                <Wind className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-orange-500">
                  공랭 (Air Cooling)
                </h2>
                <p className="text-muted-foreground">
                  가장 전통적이고 널리 사용되는 냉각 방식
                </p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-6">
            {/* Principles */}
            <motion.div variants={fadeInUp}>
              <SectionCard className="border-orange-500/20">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5 text-orange-500" />
                  작동 원리
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">자연 대류 (Natural Convection)</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      온도 차에 의한 공기 밀도 변화로 자연적인 대류가 발생합니다.
                      팬 없이 히트싱크만으로 열을 방출하며, 소음이 없지만
                      냉각 능력이 매우 제한적입니다.
                    </p>
                    <div className="p-3 rounded-lg bg-muted/30 text-sm">
                      <strong>열전달 계수:</strong> <InlineFormula>{"h \\approx 5 \\sim 25 \\text{ W/m}^2\\text{K}"}</InlineFormula><br />
                      <strong>최대 Heat Flux:</strong> ~5 W/cm²<br />
                      <strong>적용:</strong> 저전력 IoT, 임베디드 시스템
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">강제 대류 (Forced Convection)</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      팬을 사용하여 공기를 강제로 순환시킵니다. 히트싱크와
                      조합하여 열전달 계수를 크게 높일 수 있으나, 공기의
                      낮은 열용량으로 인한 본질적 한계가 있습니다.
                    </p>
                    <div className="p-3 rounded-lg bg-muted/30 text-sm">
                      <strong>열전달 계수:</strong> <InlineFormula>{"h \\approx 25 \\sim 250 \\text{ W/m}^2\\text{K}"}</InlineFormula><br />
                      <strong>최대 Heat Flux:</strong> ~30 W/cm²<br />
                      <strong>적용:</strong> 일반 PC, 서버, 워크스테이션
                    </div>
                  </div>
                </div>
              </SectionCard>
            </motion.div>

            {/* Energy Calculation */}
            <motion.div variants={fadeInUp}>
              <SectionCard className="border-orange-500/20">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-orange-500" />
                  에너지 소비 계산
                </h3>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    공랭 시스템의 에너지 소비는 주로 <strong>팬</strong>과
                    데이터센터 환경에서는 <strong>CRAC(Computer Room Air Conditioning) 유닛</strong>에서
                    발생합니다.
                  </p>

                  <FormulaBox
                    formula="P_{cooling} = P_{fan} + P_{CRAC}"
                    description="총 냉각 전력 = 팬 전력 + 공조 전력"
                    variables={[
                      { symbol: "P_{fan}", meaning: "팬 소비 전력", unit: "W" },
                      { symbol: "P_{CRAC}", meaning: "공조 시스템 전력", unit: "W" },
                    ]}
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/20">
                      <h4 className="font-medium text-orange-500 mb-2">팬 전력</h4>
                      <FormulaBox
                        formula="P_{fan} \approx (0.03 \sim 0.05) \times TDP"
                        description="TDP의 3~5%가 팬 구동에 사용"
                        variables={[]}
                      />
                      <p className="text-xs text-muted-foreground">
                        예: 500W TDP → 팬 전력 약 15~25W
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/20">
                      <h4 className="font-medium text-orange-500 mb-2">CRAC 전력 (데이터센터)</h4>
                      <FormulaBox
                        formula="P_{CRAC} = \frac{Q}{COP}"
                        description="냉동기 효율에 의존"
                        variables={[
                          { symbol: "COP", meaning: "성능계수 (보통 2.5~4)", unit: "-" },
                        ]}
                      />
                      <p className="text-xs text-muted-foreground">
                        COP 3 기준, 500W 열 제거 → 167W 전력 소비
                      </p>
                    </div>
                  </div>

                  <KeyPoint variant="warning">
                    <strong>공랭 시스템 PUE:</strong> 일반적으로 1.5~2.0 범위.
                    IT 전력의 50~100%가 냉각에 추가로 소비됩니다.
                    이는 전통적 데이터센터의 가장 큰 비효율 요소입니다.
                  </KeyPoint>
                </div>
              </SectionCard>
            </motion.div>

            {/* Pros and Cons */}
            <motion.div variants={fadeInUp}>
              <SectionCard className="border-orange-500/20">
                <h3 className="font-bold text-lg mb-4">장단점 정리</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-emerald-500 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      장점
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-500">•</span>
                        <span>기술 성숙도 높음 - 검증된 신뢰성</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-500">•</span>
                        <span>초기 투자 비용 낮음</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-500">•</span>
                        <span>유지보수 용이 - 부품 교체 간단</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-500">•</span>
                        <span>누수 위험 없음</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-red-500 mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      단점
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        <span>공기의 낮은 열용량 (1.005 kJ/kg·K)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        <span>고밀도 컴퓨팅에 부적합 (&gt;30 W/cm²)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        <span>소음 발생 - 데이터센터 60~80 dB</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        <span>에너지 효율 낮음 (PUE 1.5~2.0)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </SectionCard>
            </motion.div>
          </div>
        </motion.section>

        {/* ================================================================== */}
        {/* SINGLE-PHASE LIQUID COOLING (단상 수냉) */}
        {/* ================================================================== */}
        <motion.section
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mb-16"
        >
          <motion.div variants={fadeInUp} className="mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-500/10">
                <Droplets className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-blue-500">
                  단상 수냉 (Single-Phase Liquid Cooling)
                </h2>
                <p className="text-muted-foreground">
                  물/글리콜 냉각수의 현열을 이용한 냉각 - 현재 하이퍼스케일러 주력 기술
                </p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-6">
            {/* Single Phase Overview */}
            <motion.div variants={fadeInUp}>
              <SectionCard className="border-blue-500/20">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-500" />
                  작동 원리
                </h3>
                <p className="text-muted-foreground mb-4">
                  Cold Plate 내부의 미세 채널을 통해 <strong>물 또는 물-글리콜 혼합액</strong>이 흐르며
                  칩의 열을 흡수합니다. 냉각수 온도가 올라가면서 열을 흡수하는{" "}
                  <strong className="text-blue-500">현열(Sensible Heat) 전달</strong> 방식입니다.
                  상변화가 없어 시스템이 단순하고 안정적입니다.
                </p>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="p-4 rounded-lg bg-muted/30">
                    <div className="font-medium mb-2">냉매</div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• <strong>물:</strong> 비열 4.18 kJ/kg·K</li>
                      <li>• <strong>물-글리콜:</strong> 동결 방지</li>
                      <li>• <strong>탈이온수:</strong> 전기전도도 최소화</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30">
                    <div className="font-medium mb-2">열전달 메커니즘</div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• <strong>현열</strong> 전달만 이용</li>
                      <li>• Q = ṁ × Cp × ΔT</li>
                      <li>• 상변화 없음 (액체 유지)</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-500/10">
                    <div className="font-medium mb-2 text-blue-500">성능 특성</div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• h: <strong>3,000~10,000 W/m²K</strong></li>
                      <li>• Max Heat Flux: <strong>~100 W/cm²</strong></li>
                      <li>• 시스템: 펌프 + 열교환기</li>
                    </ul>
                  </div>
                </div>

                <FormulaBox
                  formula="Q = \dot{m} \cdot C_p \cdot (T_{out} - T_{in})"
                  description="단상 수냉의 열전달량 - 냉각수 온도 상승에 비례"
                  variables={[
                    { symbol: "\\dot{m}", meaning: "질량유량", unit: "kg/s" },
                    { symbol: "C_p", meaning: "정압비열 (물: 4.18)", unit: "kJ/kg·K" },
                    { symbol: "T_{out} - T_{in}", meaning: "냉각수 온도 상승", unit: "°C" },
                  ]}
                />
              </SectionCard>
            </motion.div>

            {/* Temperature Options */}
            <motion.div variants={fadeInUp}>
              <SectionCard className="border-blue-500/20">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-blue-500" />
                  냉각수 온도 선택
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                    <h4 className="font-medium text-blue-500 mb-2">냉각수 20°C 운전</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      냉각수 온도를 20°C로 유지합니다. 주변 온도보다 낮으므로
                      반드시 <strong>기계식 칠러(Chiller)</strong>가 필요합니다.
                    </p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">열전달 계수</span>
                        <span className="font-medium">~5,000 W/m²K</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">열적 여유</span>
                        <span className="font-medium text-emerald-500">큼 (T_j - T_c = 65°C)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">에너지 효율</span>
                        <span className="font-medium text-amber-500">중간 (칠러 COP 3~4)</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
                    <h4 className="font-medium text-cyan-500 mb-2">냉각수 45°C 운전 (NVIDIA 권장)</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      NVIDIA Blackwell 권장 온도. 주변 온도가 35°C 이하면
                      <strong> Free Cooling</strong>이 가능하여 에너지를 크게 절감합니다.
                    </p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">열전달 계수</span>
                        <span className="font-medium">~4,500 W/m²K</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">열적 여유</span>
                        <span className="font-medium text-amber-500">작음 (T_j - T_c = 40°C)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">에너지 효율</span>
                        <span className="font-medium text-emerald-500">높음 (Free Cooling)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </SectionCard>
            </motion.div>

            {/* Why 40°C Cooling */}
            <motion.div variants={fadeInUp}>
              <SectionCard className="border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 to-transparent">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-cyan-500" />
                  왜 40°C 냉각수를 고려하는가?
                </h3>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    전통적으로 냉각수는 낮을수록 좋다고 생각하지만,
                    <strong className="text-cyan-500">에너지 효율</strong> 관점에서는
                    그렇지 않습니다.
                  </p>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-card border">
                      <div className="text-3xl font-bold text-red-500 mb-2">20°C</div>
                      <div className="text-sm font-medium mb-1">칠러 필수</div>
                      <p className="text-xs text-muted-foreground">
                        주변 온도 35°C에서 15°C의 온도차를 역방향으로 만들어야 함.
                        칠러 COP 3~4 기준 상당한 전력 소비.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-card border">
                      <div className="text-3xl font-bold text-amber-500 mb-2">35°C</div>
                      <div className="text-sm font-medium mb-1">경계 조건</div>
                      <p className="text-xs text-muted-foreground">
                        주변 온도와 동일. 자연 대류만으로는 열 방출이 거의 불가능한
                        임계 지점.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-card border border-emerald-500/30">
                      <div className="text-3xl font-bold text-emerald-500 mb-2">40°C</div>
                      <div className="text-sm font-medium mb-1">Free Cooling 가능</div>
                      <p className="text-xs text-muted-foreground">
                        주변 온도보다 5°C 높음. 드라이 쿨러만으로 열 방출 가능.
                        칠러 없이 운전하여 에너지 90% 절감.
                      </p>
                    </div>
                  </div>

                  <KeyPoint variant="success">
                    <strong>Free Cooling의 조건:</strong> <InlineFormula>{"T_{coolant} > T_{ambient} + \\Delta T_{approach}"}</InlineFormula>{" "}
                    (보통 5~10°C). 이 조건을 만족하면 칠러 없이 팬과 드라이 쿨러만으로
                    열을 외부로 방출할 수 있습니다.
                  </KeyPoint>

                  <FormulaBox
                    formula="COP_{equivalent} = \frac{Q}{P_{fan}} \approx 10 \sim 20"
                    description="Free Cooling 시 등가 COP - 칠러(COP 3~4) 대비 3~6배 효율"
                    variables={[]}
                  />
                </div>
              </SectionCard>
            </motion.div>

            {/* NVIDIA 45°C Recommendation */}
            <motion.div variants={fadeInUp}>
              <SectionCard className="border-green-500/30 bg-gradient-to-br from-green-500/5 to-transparent">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  NVIDIA Blackwell: 45°C 냉각수 권장
                </h3>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    NVIDIA는 차세대 AI 가속기 <strong>Blackwell (B200, GB200)</strong>의 액체냉각 시스템에서
                    <strong className="text-green-500"> 45°C 냉각수</strong>를 권장합니다.
                    이는 데이터센터 에너지 효율을 혁신적으로 개선하는 핵심 결정입니다.
                  </p>

                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                    <blockquote className="text-sm italic text-muted-foreground border-l-4 border-green-500 pl-4">
                      &ldquo;Our chips run at 85 and 90°C. That means that I need 45°C water into it.
                      That means it&apos;s a dry cooler everywhere in the world.&rdquo;
                      <footer className="mt-2 text-xs not-italic">
                        — Wade Vinson, NVIDIA (DCAC Live 2024)
                      </footer>
                    </blockquote>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-3 text-green-500">NVIDIA의 설계 철학</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                          <span><strong>칠러 불필요:</strong> 45°C 냉각수는 전 세계 어디서나 드라이쿨러만으로 달성 가능</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                          <span><strong>충분한 열적 여유:</strong> 칩 T<sub>j,max</sub> 85~90°C, 냉각수 45°C → ΔT = 40~45°C 확보</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                          <span><strong>운영비 절감:</strong> 데이터센터 냉각 에너지 대폭 절감</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3 text-green-500">GB200 NVL72 사양</h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between p-2 rounded bg-muted/30">
                          <span className="text-muted-foreground">랙당 전력</span>
                          <span className="font-medium">120~140 kW</span>
                        </div>
                        <div className="flex justify-between p-2 rounded bg-muted/30">
                          <span className="text-muted-foreground">냉각 방식</span>
                          <span className="font-medium">Direct Liquid Cooling</span>
                        </div>
                        <div className="flex justify-between p-2 rounded bg-muted/30">
                          <span className="text-muted-foreground">권장 냉각수 온도</span>
                          <span className="font-medium text-green-500">45°C</span>
                        </div>
                        <div className="flex justify-between p-2 rounded bg-muted/30">
                          <span className="text-muted-foreground">공랭 대비 효율</span>
                          <span className="font-medium text-green-500">25배 향상</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
                    <span className="text-amber-600 dark:text-amber-400">
                      출처: NVIDIA Blog, DCAC Live 2024, Tom&apos;s Hardware
                    </span>
                  </div>
                </div>
              </SectionCard>
            </motion.div>

            {/* Energy Calculation */}
            <motion.div variants={fadeInUp}>
              <SectionCard className="border-blue-500/20">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-blue-500" />
                  에너지 소비 계산
                </h3>
                <div className="space-y-4">
                  <FormulaBox
                    formula="P_{cooling} = P_{pump} + P_{heat\,rejection}"
                    description="총 냉각 전력 = 펌프 전력 + 열 방출 전력"
                    variables={[
                      { symbol: "P_{pump}", meaning: "순환 펌프 전력", unit: "W" },
                      { symbol: "P_{heat\\,rejection}", meaning: "열 방출 시스템 전력", unit: "W" },
                    ]}
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                      <h4 className="font-medium text-blue-500 mb-2">20°C 운전 (칠러 사용)</h4>
                      <FormulaBox
                        formula="P = P_{pump} + \frac{Q}{COP}"
                        description=""
                        variables={[
                          { symbol: "COP", meaning: "칠러 성능계수", unit: "3~4" },
                        ]}
                      />
                      <p className="text-xs text-muted-foreground">
                        500W 열 제거 시:<br />
                        펌프 50W + 칠러 125W (COP 4) = <strong>175W</strong>
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
                      <h4 className="font-medium text-cyan-500 mb-2">40°C 운전 (Free Cooling)</h4>
                      <FormulaBox
                        formula="P = P_{pump} + P_{dry\,cooler\,fan}"
                        description=""
                        variables={[]}
                      />
                      <p className="text-xs text-muted-foreground">
                        500W 열 제거 시:<br />
                        펌프 45W + 팬 30W = <strong>75W</strong>
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-emerald-500" />
                      <span className="font-medium">에너지 절감 효과</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      40°C Free Cooling은 20°C 칠러 운전 대비 <strong className="text-emerald-500">
                      약 57% 에너지 절감</strong> (175W → 75W)
                    </p>
                  </div>
                </div>
              </SectionCard>
            </motion.div>

            {/* Pros and Cons */}
            <motion.div variants={fadeInUp}>
              <SectionCard className="border-blue-500/20">
                <h3 className="font-bold text-lg mb-4">장단점 정리</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-emerald-500 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      장점
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-500">•</span>
                        <span>물의 높은 열용량 (4.18 kJ/kg·K) - 공기 대비 4배</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-500">•</span>
                        <span>높은 Heat Flux 처리 (~100 W/cm²)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-500">•</span>
                        <span>기존 인프라 활용 가능</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-500">•</span>
                        <span>40°C 운전 시 Free Cooling으로 고효율</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-red-500 mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      단점
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        <span>누수 위험 - 전자기기 손상 가능</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        <span>복잡한 배관 인프라 필요</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        <span>20°C 운전 시 칠러로 인한 전력 소비</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        <span>정기적인 유지보수 필요 (수질 관리, 펌프 등)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </SectionCard>
            </motion.div>

            {/* Cold Plate Hyperscaler Adoption */}
            <motion.div variants={fadeInUp}>
              <SectionCard className="border-blue-500/20">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  하이퍼스케일러의 Cold Plate 도입 현황
                </h3>
                <p className="text-muted-foreground mb-4">
                  Cold Plate(Direct-to-Chip) 액체냉각은 현재 하이퍼스케일러들이 <strong>가장 적극적으로 도입</strong>하는
                  냉각 기술입니다. 침수냉각 대비 운영 복잡성이 낮고, 기존 데이터센터에 쉽게 적용 가능하기 때문입니다.
                </p>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  {/* Microsoft */}
                  <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <span className="text-blue-500 font-bold text-xs">MS</span>
                      </div>
                      <span className="font-medium">Microsoft Azure</span>
                    </div>
                    <ul className="space-y-2 text-xs text-muted-foreground">
                      <li>• <strong>2024.08:</strong> 모든 신규 AI DC에 액체냉각 표준화</li>
                      <li>• 140kW 랙 대응 Cold Plate 시스템</li>
                      <li>• <strong className="text-blue-500">물 사용 제로</strong> 목표 (Closed-loop)</li>
                      <li>• 45°C 냉각수로 Free Cooling 적용</li>
                    </ul>
                  </div>

                  {/* Google */}
                  <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                        <span className="text-red-500 font-bold text-xs">G</span>
                      </div>
                      <span className="font-medium">Google Cloud</span>
                    </div>
                    <ul className="space-y-2 text-xs text-muted-foreground">
                      <li>• <strong>2018:</strong> TPU v3부터 Cold Plate 도입</li>
                      <li>• 7년간 <strong className="text-red-500">2,000+ TPU Pod</strong> 운영</li>
                      <li>• Project Deschutes: CDU 가동률 99.999%</li>
                      <li>• OCP에서 1MW 랙 냉각 기술 발표</li>
                    </ul>
                  </div>

                  {/* Meta */}
                  <div className="p-4 rounded-xl bg-blue-600/5 border border-blue-600/20">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-xs">M</span>
                      </div>
                      <span className="font-medium">Meta</span>
                    </div>
                    <ul className="space-y-2 text-xs text-muted-foreground">
                      <li>• <strong>AALC</strong> (Air-Assisted Liquid Cooling) 채택</li>
                      <li>• MS와 공동 개발, 랙당 <strong className="text-blue-600">40kW+</strong></li>
                      <li>• <strong>2025:</strong> 전 데이터센터에 AALC 배치</li>
                      <li>• <strong>2030:</strong> 전면 액체냉각 전환 목표</li>
                    </ul>
                  </div>
                </div>

                <KeyPoint variant="info">
                  <strong>왜 Cold Plate인가?</strong> 침수냉각 대비 (1) 기존 랙/서버 호환성 높음,
                  (2) 운영/유지보수 용이, (3) 서버 교체/업그레이드 간편.
                  하이퍼스케일러들은 대규모 운영 효율성을 위해 Cold Plate를 선호합니다.
                </KeyPoint>

                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs mt-4">
                  <span className="text-amber-600 dark:text-amber-400">
                    출처: Microsoft News (2024), Google Cloud Blog, Data Center Frontier, Meta OCP Summit (2024)
                  </span>
                </div>
              </SectionCard>
            </motion.div>
          </div>
        </motion.section>

        {/* ================================================================== */}
        {/* TWO-PHASE LIQUID COOLING (이상 수냉) */}
        {/* ================================================================== */}
        <motion.section
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mb-16"
        >
          <motion.div variants={fadeInUp} className="mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-500/10">
                <Droplets className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-purple-500">
                  이상 수냉 (Two-Phase Liquid Cooling)
                </h2>
                <p className="text-muted-foreground">
                  냉매의 잠열을 이용한 Cold Plate 냉각 - R&D 단계 차세대 기술
                </p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-6">
            {/* Two-Phase Overview */}
            <motion.div variants={fadeInUp}>
              <SectionCard className="border-purple-500/20">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5 text-purple-500" />
                  작동 원리
                </h3>
                <p className="text-muted-foreground mb-4">
                  Cold Plate 내부에서 <strong>냉매(R134a, CO₂ 등)</strong>가 비등하면서
                  <strong className="text-purple-500"> 잠열(Latent Heat)</strong>을 통해 열을 흡수합니다.
                  단상 수냉 대비 열전달 계수가 10배 이상 높아 극한의 발열량을 처리할 수 있습니다.
                </p>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="p-4 rounded-lg bg-muted/30">
                    <div className="font-medium mb-2">냉매</div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• <strong>R134a:</strong> T<sub>sat</sub> = 26°C @6.7bar</li>
                      <li>• <strong>CO₂ (R744):</strong> 친환경, 고압</li>
                      <li>• <strong>R1234ze:</strong> 저GWP 대체냉매</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30">
                    <div className="font-medium mb-2">열전달 메커니즘</div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• <strong>잠열</strong> 전달 (비등)</li>
                      <li>• Q = ṁ × h<sub>fg</sub></li>
                      <li>• 액체 → 기체 상변화</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-purple-500/10">
                    <div className="font-medium mb-2 text-purple-500">성능 특성</div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• h: <strong>10,000~50,000 W/m²K</strong></li>
                      <li>• Max Heat Flux: <strong>~200 W/cm²</strong></li>
                      <li>• CHF 한계 존재</li>
                    </ul>
                  </div>
                </div>

                <FormulaBox
                  formula="Q = \dot{m} \cdot h_{fg}"
                  description="이상 수냉의 열전달량 - 냉매의 증발잠열에 비례"
                  variables={[
                    { symbol: "\\dot{m}", meaning: "냉매 질량유량", unit: "kg/s" },
                    { symbol: "h_{fg}", meaning: "증발잠열 (R134a: 217)", unit: "kJ/kg" },
                  ]}
                />
              </SectionCard>
            </motion.div>

            {/* CHF Limit */}
            <motion.div variants={fadeInUp}>
              <SectionCard className="border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  CHF (Critical Heat Flux) - 물리적 한계
                </h3>
                <p className="text-muted-foreground mb-4">
                  이상 수냉의 핵심 제약은 <strong className="text-red-500">임계열유속(CHF)</strong>입니다.
                  열유속이 CHF를 초과하면 막비등(Film Boiling)이 발생하여 열전달이 급격히 감소하고
                  칩이 과열됩니다.
                </p>

                <FormulaBox
                  formula="q''_{CHF} = 0.131 \cdot h_{fg} \cdot \rho_v \cdot \left[ \frac{\sigma g (\rho_l - \rho_v)}{\rho_v^2} \right]^{1/4}"
                  description="Zuber 상관식 - Pool Boiling CHF 예측"
                  variables={[
                    { symbol: "h_{fg}", meaning: "증발잠열", unit: "J/kg" },
                    { symbol: "\\rho_v, \\rho_l", meaning: "증기/액체 밀도", unit: "kg/m³" },
                    { symbol: "\\sigma", meaning: "표면장력", unit: "N/m" },
                  ]}
                />

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="p-4 rounded-lg bg-muted/30">
                    <div className="font-medium mb-2">대표적인 CHF 값</div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• <strong>R134a (Pool):</strong> ~15 W/cm²</li>
                      <li>• <strong>R134a (Flow):</strong> ~100-200 W/cm²</li>
                      <li>• <strong>물 (Pool):</strong> ~100-150 W/cm²</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-red-500/10">
                    <div className="font-medium mb-2 text-red-500">CHF 초과 시</div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• 막비등(Film Boiling) 발생</li>
                      <li>• 열전달 계수 급감</li>
                      <li>• 칩 온도 급상승 → 손상</li>
                    </ul>
                  </div>
                </div>
              </SectionCard>
            </motion.div>

            {/* System Types */}
            <motion.div variants={fadeInUp}>
              <SectionCard className="border-purple-500/20">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-500" />
                  시스템 유형
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
                    <h4 className="font-medium text-purple-500 mb-2">P2P (Pump-2-Phase)</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      펌프로 냉매를 순환시키는 방식. 압축기 없이 비등/응축 사이클만 사용하여
                      에너지 효율이 높습니다.
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• 압축기 불필요 → 저전력</li>
                      <li>• 단순한 구조</li>
                      <li>• 냉매 온도 = 주변 온도 + α</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                    <h4 className="font-medium text-blue-500 mb-2">Vapor Compression (증기압축)</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      압축기로 냉매를 압축하여 주변 온도보다 낮은 증발 온도를 구현.
                      더 높은 냉각 성능을 제공합니다.
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• 압축기 필요 → 고전력</li>
                      <li>• 냉매 온도 &lt; 주변 온도 가능</li>
                      <li>• 에어컨/냉장고와 동일 원리</li>
                    </ul>
                  </div>
                </div>
              </SectionCard>
            </motion.div>

            {/* Pros and Cons */}
            <motion.div variants={fadeInUp}>
              <SectionCard className="border-purple-500/20">
                <h3 className="font-bold text-lg mb-4">장단점 정리</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-emerald-500 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      장점
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-500">•</span>
                        <span>단상 수냉 대비 10배 높은 열전달 계수</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-500">•</span>
                        <span>200 W/cm² 이상의 Heat Flux 처리</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-500">•</span>
                        <span>등온 냉각 (균일한 칩 온도)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-500">•</span>
                        <span>P2P 방식은 저전력 운전 가능</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-red-500 mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      단점
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        <span>CHF 한계로 인한 설계 제약</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        <span>냉매 누출 시 환경 영향 (GWP)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        <span>복잡한 시스템 (밸브, 센서 등)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        <span>아직 R&D 단계, 상용화 초기</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <KeyPoint variant="warning">
                  <strong>현재 상태:</strong> 이상 수냉(Two-Phase Cold Plate)은 아직 대규모 상용화 단계가 아닙니다.
                  하이퍼스케일러들은 단상 수냉(물 기반 Cold Plate)을 선택하고 있으며,
                  이상 수냉은 차세대 고발열 칩(1000W+)을 위한 연구개발 중입니다.
                </KeyPoint>
              </SectionCard>
            </motion.div>
          </div>
        </motion.section>

        {/* ================================================================== */}
        {/* IMMERSION COOLING */}
        {/* ================================================================== */}
        <motion.section
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mb-16"
        >
          <motion.div variants={fadeInUp} className="mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-teal-500/10">
                <Droplets className="h-6 w-6 text-teal-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-teal-500">
                  침수냉각 (Immersion Cooling)
                </h2>
                <p className="text-muted-foreground">
                  2상 비등 열전달을 이용한 초고효율 냉각
                </p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-6">
            {/* Principles */}
            <motion.div variants={fadeInUp}>
              <SectionCard className="border-teal-500/20">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5 text-teal-500" />
                  작동 원리
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-muted-foreground mb-4">
                      전자 부품을 <strong>유전성(Dielectric) 냉매</strong>에
                      완전히 담그는 방식입니다. 칩 표면에서 냉매가 비등(Boiling)하면서
                      증발잠열을 통해 열을 흡수합니다.
                    </p>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-muted/30">
                        <h4 className="font-medium text-sm mb-1">1상 침수 (Single-Phase)</h4>
                        <p className="text-xs text-muted-foreground">
                          비등 없이 액체 상태로만 열 흡수. 단순하지만 효율이 낮음.
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-teal-500/10 border border-teal-500/20">
                        <h4 className="font-medium text-sm mb-1 text-teal-500">2상 침수 (Two-Phase)</h4>
                        <p className="text-xs text-muted-foreground">
                          비등 열전달 활용. 증발잠열로 초고효율 냉각 달성.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">비등 열전달의 장점</h4>
                    <FormulaBox
                      formula="Q = h \cdot A \cdot \Delta T"
                      description="비등 시 h가 급격히 증가"
                      variables={[
                        { symbol: "h_{boiling}", meaning: "비등 열전달계수", unit: "10,000~50,000 W/m²K" },
                        { symbol: "h_{convection}", meaning: "대류 열전달계수", unit: "100~5,000 W/m²K" },
                      ]}
                    />
                    <p className="text-sm text-muted-foreground">
                      비등 열전달은 강제 대류 대비 <strong>10~100배</strong> 높은
                      열전달 계수를 제공합니다. 이는 증발 시 잠열(Latent Heat)을
                      활용하기 때문입니다.
                    </p>
                  </div>
                </div>
              </SectionCard>
            </motion.div>

            {/* Working Fluid vs Condenser Cooling Water */}
            <motion.div variants={fadeInUp}>
              <SectionCard className="border-teal-500/20">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-teal-500" />
                  냉매(작동유체) vs 컨덴서 냉각수: 핵심 구분
                </h3>
                <p className="text-muted-foreground mb-4">
                  2상 침수냉각 시스템에서는 <strong className="text-teal-500">두 가지 유체</strong>가 서로 다른 역할을 합니다.
                  이 둘을 명확히 구분하는 것이 시스템 이해의 핵심입니다.
                </p>

                {/* System Diagram */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-red-500/5 via-amber-500/5 to-blue-500/5 border border-border/50 mb-6">
                  <h4 className="font-medium mb-4 text-center">2상 침수냉각 시스템 구조</h4>
                  <div className="flex flex-col md:flex-row items-center justify-center gap-3 text-sm">
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-center min-w-[100px]">
                      <div className="font-medium text-red-500">칩 (열원)</div>
                      <div className="text-xs text-muted-foreground">85~105°C</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90 md:rotate-0" />
                    <div className="p-3 rounded-lg bg-teal-500/10 border border-teal-500/30 text-center min-w-[120px]">
                      <div className="font-medium text-teal-500">냉매 비등</div>
                      <div className="text-xs text-muted-foreground">T<sub>sat</sub> ≈ 49~61°C</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90 md:rotate-0" />
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-center min-w-[100px]">
                      <div className="font-medium text-amber-500">증기 상승</div>
                      <div className="text-xs text-muted-foreground">잠열 흡수</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90 md:rotate-0" />
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-center min-w-[120px]">
                      <div className="font-medium text-blue-500">컨덴서</div>
                      <div className="text-xs text-muted-foreground">냉각수 20~40°C</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90 md:rotate-0" />
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center min-w-[100px]">
                      <div className="font-medium text-emerald-500">액체 복귀</div>
                      <div className="text-xs text-muted-foreground">순환</div>
                    </div>
                  </div>
                </div>

                {/* Two Fluids Comparison */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Working Fluid */}
                  <div className="p-5 rounded-xl bg-teal-500/5 border-2 border-teal-500/30">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-teal-500/20">
                        <Droplets className="h-5 w-5 text-teal-500" />
                      </div>
                      <div>
                        <h4 className="font-bold text-teal-500">냉매 (작동유체)</h4>
                        <p className="text-xs text-muted-foreground">전자기기를 담그는 유체</p>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="p-3 rounded-lg bg-muted/30">
                        <div className="font-medium mb-1">역할</div>
                        <p className="text-xs text-muted-foreground">
                          전자기기가 직접 담기는 <strong>유전성(Dielectric) 유체</strong>.
                          칩 표면에서 비등하며 잠열을 통해 열을 흡수합니다.
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-muted/30">
                        <div className="font-medium mb-1">대표 냉매</div>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• <strong>3M Novec 649:</strong> T<sub>sat</sub> = 49°C</li>
                          <li>• <strong>3M Novec 7100:</strong> T<sub>sat</sub> = 61°C</li>
                          <li>• <strong>3M Fluorinert FC-72:</strong> T<sub>sat</sub> = 56°C</li>
                        </ul>
                      </div>

                      <div className="p-3 rounded-lg bg-teal-500/10">
                        <div className="font-medium mb-1 text-teal-500">핵심 특성</div>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• <strong>포화온도(T<sub>sat</sub>):</strong> 비등이 시작되는 온도 (고정값)</li>
                          <li>• <strong>과냉도(Subcooling):</strong> T<sub>sat</sub> - T<sub>liquid</sub></li>
                          <li>• <strong>유전성:</strong> 전기 절연 특성 (단락 위험 없음)</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Condenser Cooling Water */}
                  <div className="p-5 rounded-xl bg-blue-500/5 border-2 border-blue-500/30">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        <Droplets className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <h4 className="font-bold text-blue-500">컨덴서 냉각수</h4>
                        <p className="text-xs text-muted-foreground">열을 외부로 방출하는 매체</p>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="p-3 rounded-lg bg-muted/30">
                        <div className="font-medium mb-1">역할</div>
                        <p className="text-xs text-muted-foreground">
                          컨덴서 내부를 흐르며 <strong>기화된 냉매를 응축</strong>시킵니다.
                          냉매와 직접 접촉하지 않고, 열교환기를 통해 열만 전달받습니다.
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-muted/30">
                        <div className="font-medium mb-1">냉각수 종류</div>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• <strong>칠러 냉각수:</strong> 15~25°C (칠러 필요)</li>
                          <li>• <strong>쿨링타워 물:</strong> 25~35°C (습식)</li>
                          <li>• <strong>드라이쿨러 물:</strong> 35~45°C (Free Cooling)</li>
                        </ul>
                      </div>

                      <div className="p-3 rounded-lg bg-blue-500/10">
                        <div className="font-medium mb-1 text-blue-500">에너지 효율 결정</div>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• <strong>20°C:</strong> 칠러 필요 → 높은 에너지 소비</li>
                          <li>• <strong>40°C:</strong> Free Cooling → 에너지 90% 절감</li>
                          <li>• 냉각수 온도가 <strong>시스템 PUE를 결정</strong></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Distinction */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-teal-500/10 to-blue-500/10 border border-teal-500/20 mb-6">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" />
                    핵심 구분 포인트
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-3 font-medium">구분</th>
                          <th className="text-center py-2 px-3 font-medium text-teal-500">냉매 (작동유체)</th>
                          <th className="text-center py-2 px-3 font-medium text-blue-500">컨덴서 냉각수</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-3">위치</td>
                          <td className="text-center py-2 px-3">탱크 내부 (전자기기 침수)</td>
                          <td className="text-center py-2 px-3">컨덴서 내부 (외부 순환)</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-3">유체 종류</td>
                          <td className="text-center py-2 px-3">유전성 냉매 (Novec 등)</td>
                          <td className="text-center py-2 px-3">물 또는 글리콜 혼합</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-3">온도</td>
                          <td className="text-center py-2 px-3">T<sub>sat</sub> ≈ 49~61°C (고정)</td>
                          <td className="text-center py-2 px-3">20~45°C (설계 선택)</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 px-3">상변화</td>
                          <td className="text-center py-2 px-3">액체 ↔ 기체 (비등/응축)</td>
                          <td className="text-center py-2 px-3">없음 (현열 전달만)</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3">에너지 영향</td>
                          <td className="text-center py-2 px-3">열전달 성능 결정</td>
                          <td className="text-center py-2 px-3 font-medium text-blue-500">PUE/에너지 효율 결정</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Condenser Water Temperature Selection */}
                <h4 className="font-bold mb-4 flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-blue-500" />
                  컨덴서 냉각수 온도 선택의 영향
                </h4>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                    <h5 className="font-medium text-blue-500 mb-2">냉각수 20°C 운전</h5>
                    <p className="text-xs text-muted-foreground mb-3">
                      주변온도(35°C)보다 낮은 냉각수를 만들어야 하므로
                      <strong className="text-blue-500"> 기계식 칠러가 필수</strong>입니다.
                    </p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between p-2 rounded bg-muted/30">
                        <span>열 방출 방식</span>
                        <span className="font-medium text-blue-500">칠러 (COP 3~4)</span>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-muted/30">
                        <span>냉매 과냉도</span>
                        <span className="font-medium">높음 (~30°C)</span>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-blue-500/10">
                        <span>예상 PUE</span>
                        <span className="font-medium text-amber-500">1.15~1.25</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                    <h5 className="font-medium text-emerald-500 mb-2">냉각수 40°C 운전</h5>
                    <p className="text-xs text-muted-foreground mb-3">
                      주변온도(35°C)보다 높으므로 자연적으로 열 방출 가능.
                      <strong className="text-emerald-500"> Free Cooling</strong> 적용.
                    </p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between p-2 rounded bg-muted/30">
                        <span>열 방출 방식</span>
                        <span className="font-medium text-emerald-500">드라이쿨러 (Free)</span>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-muted/30">
                        <span>냉매 과냉도</span>
                        <span className="font-medium">낮음 (~10°C)</span>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-emerald-500/10">
                        <span>예상 PUE</span>
                        <span className="font-medium text-emerald-500">1.02~1.08</span>
                      </div>
                    </div>
                  </div>
                </div>

                <KeyPoint variant="success">
                  <strong>핵심 요약:</strong> 냉매의 포화온도(T<sub>sat</sub>)는 냉매 종류에 따라 고정되지만,
                  <strong> 컨덴서 냉각수의 온도는 설계자가 선택</strong>합니다.
                  40°C 냉각수를 선택하면 칠러 없이 Free Cooling이 가능해져 에너지를 <strong>90% 이상</strong> 절감할 수 있습니다.
                </KeyPoint>
              </SectionCard>
            </motion.div>

            {/* Energy Calculation */}
            <motion.div variants={fadeInUp}>
              <SectionCard className="border-teal-500/20">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-teal-500" />
                  에너지 소비 계산
                </h3>
                <div className="space-y-4">
                  <FormulaBox
                    formula="P_{cooling} = P_{circulation} + P_{condenser}"
                    description="총 냉각 전력 = 순환 전력 + 응축기 전력"
                    variables={[
                      { symbol: "P_{circulation}", meaning: "냉매 순환 펌프", unit: "W" },
                      { symbol: "P_{condenser}", meaning: "응축기(열 방출) 시스템", unit: "W" },
                    ]}
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-teal-500/5 border border-teal-500/20">
                      <h4 className="font-medium text-teal-500 mb-2">20°C 운전</h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        500W 열 제거 시:
                      </p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">순환 펌프</span>
                          <span>20W</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">칠러 (COP 4)</span>
                          <span>100W</span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-1 mt-1">
                          <span>합계</span>
                          <span>120W</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                      <h4 className="font-medium text-emerald-500 mb-2">40°C 운전 (Free Cooling)</h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        500W 열 제거 시:
                      </p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">순환 펌프</span>
                          <span>15W</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">드라이 쿨러 팬</span>
                          <span>10W</span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-1 mt-1">
                          <span>합계</span>
                          <span className="text-emerald-500">25W</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Leaf className="h-5 w-5 text-emerald-500" />
                      <span className="font-medium">공랭 대비 에너지 절감</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-orange-500">175W</div>
                        <div className="text-xs text-muted-foreground">공랭 (CRAC)</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-teal-500">120W</div>
                        <div className="text-xs text-muted-foreground">침수 20°C</div>
                        <div className="text-xs text-emerald-500">-31%</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-emerald-500">25W</div>
                        <div className="text-xs text-muted-foreground">침수 40°C</div>
                        <div className="text-xs text-emerald-500">-86%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </SectionCard>
            </motion.div>

            {/* Passive Thermosyphon Condenser */}
            <motion.div variants={fadeInUp}>
              <SectionCard className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-500" />
                  패시브 응축: 전력 소모 제로 냉각
                </h3>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    침수냉각의 증기를 응축시키는 방법으로 <strong className="text-purple-500">히트파이프</strong>나{" "}
                    <strong className="text-purple-500">써모사이폰(Thermosyphon)</strong>을 사용하면,
                    펌프나 팬 없이 <strong>완전 패시브</strong> 냉각이 가능합니다.
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
                      <h4 className="font-medium text-purple-500 mb-2">써모사이폰 컨덴서</h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        증기는 자연 부력으로 상승하여 외부 공기로 노출된 컨덴서에서 응축.
                        액체는 중력으로 복귀. <strong>펌프 전력 불필요.</strong>
                      </p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">순환 동력</span>
                          <span className="font-medium text-emerald-500">0W (중력)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">응축 동력</span>
                          <span className="font-medium text-emerald-500">0W 또는 팬 일부</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">조건</span>
                          <span className="font-medium">T<sub>sat</sub> &gt; T<sub>ambient</sub></span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
                      <h4 className="font-medium text-purple-500 mb-2">히트파이프 컨덴서</h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        모세관 작용(Capillary Wicking)으로 작동. 중력에 의존하지 않아
                        설치 방향에 자유도가 높음. <strong>완전 수동 열전달.</strong>
                      </p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">용량</span>
                          <span className="font-medium">100~500W/pipe</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">수명</span>
                          <span className="font-medium text-emerald-500">30년+</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">유지보수</span>
                          <span className="font-medium text-emerald-500">불필요</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-emerald-500/10 border border-purple-500/20">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4 text-emerald-500" />
                      궁극의 에너지 효율
                    </h4>
                    <div className="grid grid-cols-4 gap-3 text-center text-xs">
                      <div>
                        <div className="text-lg font-bold text-orange-500">175W</div>
                        <div className="text-muted-foreground">공랭</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-teal-500">120W</div>
                        <div className="text-muted-foreground">침수 칠러</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-cyan-500">25W</div>
                        <div className="text-muted-foreground">침수 Free</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-purple-500">~5W</div>
                        <div className="text-muted-foreground">패시브</div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 text-center">
                      *패시브 시스템도 보조 팬 사용 시 약간의 전력 소모 (자연대류만 사용 시 0W)
                    </p>
                  </div>

                  <KeyPoint variant="info">
                    <strong>기술 현황:</strong> 패시브 써모사이폰 컨덴서는{" "}
                    <strong>이미 특허화된 기술</strong>입니다 (US20230046291A1, US11892223B2 등).
                    한랭 기후(북유럽, 캐나다 등)의 데이터센터에서 연중 Free Cooling과 결합하여
                    <strong> PUE 1.01~1.03</strong>을 달성하는 사례가 있습니다.
                  </KeyPoint>

                  {/* Detailed Case Studies */}
                  <div className="mt-6">
                    <h4 className="font-bold mb-4 flex items-center gap-2">
                      <Factory className="h-4 w-4 text-purple-500" />
                      패시브 냉각 적용 사례
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* TACC Lonestar6 */}
                      <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Cpu className="h-4 w-4 text-blue-500" />
                          </div>
                          <div>
                            <span className="font-medium text-sm">TACC Lonestar6</span>
                            <p className="text-xs text-muted-foreground">텍사스대학교 슈퍼컴퓨터</p>
                          </div>
                        </div>
                        <ul className="space-y-1 text-xs text-muted-foreground">
                          <li>• 미국 5위 대학 슈퍼컴퓨터 (3 petaFLOPS)</li>
                          <li>• GRC ICEraQ Series 10 침수냉각 적용</li>
                          <li>• <strong className="text-blue-500">랙당 70kW</strong> 전력 밀도</li>
                          <li>• 280W TDP CPU - 공랭 불가능한 발열</li>
                          <li>• <strong className="text-emerald-500">PUE ~1.1</strong> 달성</li>
                          <li>• 탄소발자국 <strong>40% 감소</strong></li>
                        </ul>
                      </div>

                      {/* Nordic Thermosyphon DC */}
                      <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                            <Leaf className="h-4 w-4 text-cyan-500" />
                          </div>
                          <div>
                            <span className="font-medium text-sm">북유럽 Free Cooling DC</span>
                            <p className="text-xs text-muted-foreground">핀란드, 노르웨이, 스웨덴</p>
                          </div>
                        </div>
                        <ul className="space-y-1 text-xs text-muted-foreground">
                          <li>• 연평균 기온 5~10°C → 연중 Free Cooling</li>
                          <li>• Nebius(핀란드 Mäntsälä): 폐열 지역난방 활용</li>
                          <li>• 써모사이폰 + Air-side Economizer 결합</li>
                          <li>• <strong className="text-emerald-500">PUE 1.03~1.08</strong> 달성</li>
                          <li>• 칠러 가동률: <strong>연간 0~5%</strong></li>
                          <li>• 냉각 에너지 <strong className="text-cyan-500">95% 절감</strong></li>
                        </ul>
                      </div>

                      {/* Canadian Ground Cold Storage */}
                      <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                            <Thermometer className="h-4 w-4 text-purple-500" />
                          </div>
                          <div>
                            <span className="font-medium text-sm">캐나다 지중 열저장</span>
                            <p className="text-xs text-muted-foreground">Ground Cold Energy Storage</p>
                          </div>
                        </div>
                        <ul className="space-y-1 text-xs text-muted-foreground">
                          <li>• 써모사이폰을 지중 열교환기로 활용</li>
                          <li>• 겨울철 저온을 지중에 저장</li>
                          <li>• 여름철 저장 냉열로 냉각</li>
                          <li>• 몬트리올, 토론토 등 5개 도시 연구</li>
                          <li>• 탄소발자국 <strong className="text-purple-500">50~70% 감소</strong></li>
                          <li>• 계절 에너지 저장 시스템 (STES)</li>
                        </ul>
                      </div>

                      {/* Active/Passive Hybrid */}
                      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                            <Activity className="h-4 w-4 text-amber-500" />
                          </div>
                          <div>
                            <span className="font-medium text-sm">Active/Passive 하이브리드</span>
                            <p className="text-xs text-muted-foreground">US20210368647 특허 기술</p>
                          </div>
                        </div>
                        <ul className="space-y-1 text-xs text-muted-foreground">
                          <li>• 패시브(써모사이폰) + 액티브(칠러) 이중 컨덴서</li>
                          <li>• 외기온 낮을 때: 패시브 모드 (전력 ~0W)</li>
                          <li>• 외기온 높을 때: 액티브 모드 자동 전환</li>
                          <li>• 펌프/압축기 없이 자연순환</li>
                          <li>• <strong className="text-amber-500">모든 기후</strong>에서 운영 가능</li>
                          <li>• 연간 평균 PUE: <strong>1.05~1.15</strong></li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs mt-4">
                    <span className="text-amber-600 dark:text-amber-400">
                      참고: US20230046291A1, US20210368647, US11892223B2 |
                      출처: GRC Case Study (2023), ScienceDirect - Canadian Thermosyphon Study (2024),
                      Electronics Cooling Magazine
                    </span>
                  </div>
                </div>
              </SectionCard>
            </motion.div>

            {/* Modern Significance */}
            <motion.div variants={fadeInUp}>
              <SectionCard className="border-teal-500/20">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-teal-500" />
                  침수냉각 기업 도입 사례
                </h3>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    침수냉각은 <strong className="text-teal-500">가장 높은 열전달 효율</strong>과{" "}
                    <strong className="text-teal-500">최저 PUE</strong>를 달성할 수 있는 기술입니다.
                    2024년 기준 침수냉각 시장은 <strong>$1.3B</strong>이며, 연평균 <strong>18.3%</strong> 성장하여
                    2034년 <strong>$7.2B</strong>에 도달할 전망입니다.
                  </p>

                  <p className="text-muted-foreground mb-4">
                    침수냉각은 <strong>전문 기술 기업</strong>과 <strong>고성능 컴퓨팅(HPC)</strong>,{" "}
                    <strong>AI 추론 센터</strong> 등 극한의 열밀도가 요구되는 환경에서
                    독보적인 강점을 보입니다. 최근 반도체 발열 증가로 채택이 빠르게 확대되고 있습니다.
                  </p>

                  <div className="grid md:grid-cols-3 gap-4">
                    {/* GRC */}
                    <div className="p-4 rounded-xl bg-teal-500/5 border border-teal-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center">
                          <span className="text-teal-500 font-bold text-xs">GRC</span>
                        </div>
                        <span className="font-medium">Green Revolution Cooling</span>
                      </div>
                      <ul className="space-y-2 text-xs text-muted-foreground">
                        <li>• <strong>2009년 설립</strong>, 15년 업계 선도</li>
                        <li>• <strong className="text-teal-500">22개국</strong>에 솔루션 배치</li>
                        <li>• 단상(Single-phase) 침수냉각 전문</li>
                        <li>• <strong>2024.01:</strong> Shell 휴스턴 DC 배치</li>
                        <li>• 랙당 최대 200kW 지원</li>
                      </ul>
                    </div>

                    {/* LiquidStack */}
                    <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                          <span className="text-purple-500 font-bold text-xs">LS</span>
                        </div>
                        <span className="font-medium">LiquidStack</span>
                      </div>
                      <ul className="space-y-2 text-xs text-muted-foreground">
                        <li>• Bitfury에서 <strong>2021년 분사</strong></li>
                        <li>• <strong className="text-purple-500">2상(Two-phase)</strong> 침수냉각 전문</li>
                        <li>• Trane Technologies 투자 유치</li>
                        <li>• 미국 내 제조시설 및 R&amp;D 센터 구축</li>
                        <li>• 4U 파일럿 시스템 제공</li>
                      </ul>
                    </div>

                    {/* Microsoft (Pilot) */}
                    <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <span className="text-blue-500 font-bold text-xs">MS</span>
                        </div>
                        <span className="font-medium">Microsoft (파일럿)</span>
                      </div>
                      <ul className="space-y-2 text-xs text-muted-foreground">
                        <li>• <strong>2021.04:</strong> Quincy에 2상 침수 파일럿</li>
                        <li>• Wiwynn과 협력, 48대 서버 테스트</li>
                        <li>• 전력 <strong className="text-blue-500">5~15% 절감</strong> 확인</li>
                        <li>• <strong className="text-amber-500">대규모 상용화는 Cold Plate 선택</strong></li>
                        <li>• 침수냉각은 연구/파일럿 수준</li>
                      </ul>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="p-4 rounded-lg bg-muted/30">
                      <h4 className="font-medium mb-2">침수냉각 시장 전망 (2024→2034)</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">시장 규모</span>
                          <span className="font-medium">$1.3B → $7.2B</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">연평균 성장률 (CAGR)</span>
                          <span className="font-medium text-emerald-500">18.3%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">주요 기업</span>
                          <span className="font-medium text-xs">GRC, LiquidStack, Submer, Asperitas</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30">
                      <h4 className="font-medium mb-2">침수냉각 vs Cold Plate</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• 2상 침수: 에너지 <strong>20% 절감</strong>, 물 <strong>48% 절감</strong></li>
                        <li>• 단상 침수: 에너지 <strong>15% 절감</strong>, 물 <strong>45% 절감</strong></li>
                        <li>• 열전달 용량: 2상이 단상 대비 <strong>10~100배</strong></li>
                        <li>• <strong className="text-teal-500">극고밀도 HPC/AI 환경에 최적</strong></li>
                      </ul>
                    </div>
                  </div>

                  <KeyPoint variant="success">
                    <strong>침수냉각의 가치:</strong> 반도체 발열이 급증하는 AI 시대에,
                    침수냉각은 <strong>유일하게 200W/cm² 이상</strong>의 열밀도를 처리할 수 있는 기술입니다.
                    고밀도 GPU 클러스터, HPC, AI 추론 시스템에서 점점 더 필수적인 선택지가 되고 있습니다.
                  </KeyPoint>

                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs mt-4">
                    <span className="text-amber-600 dark:text-amber-400">
                      출처: Data Center Frontier (2024), GM Insights, Microsoft News (2021), GRC Press Release
                    </span>
                  </div>
                </div>
              </SectionCard>
            </motion.div>

            {/* Pros and Cons */}
            <motion.div variants={fadeInUp}>
              <SectionCard className="border-teal-500/20">
                <h3 className="font-bold text-lg mb-4">장단점 정리</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-emerald-500 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      장점
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-500">•</span>
                        <span>최고 수준의 열전달 효율 (h: 15,000~20,000 W/m²K)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-500">•</span>
                        <span>초고밀도 Heat Flux 처리 (200+ W/cm²)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-500">•</span>
                        <span>최저 PUE 달성 (1.02~1.05)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-500">•</span>
                        <span>무소음 운전 (팬 불필요)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-500">•</span>
                        <span>유전성 냉매 - 전기적 단락 위험 없음</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-500">•</span>
                        <span>균일한 온도 분포 - 핫스팟 제거</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-red-500 mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      단점
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        <span>높은 초기 투자 비용 (탱크, 냉매)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        <span>특수 유전성 냉매 비용 (3M Novec, Fluorinert 등)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        <span>하드웨어 유지보수 시 냉매 처리 필요</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        <span>일부 냉매의 환경 영향 (GWP)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        <span>기존 인프라와의 호환성 제한</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </SectionCard>
            </motion.div>
          </div>
        </motion.section>

        {/* ================================================================== */}
        {/* COMPARISON SUMMARY */}
        {/* ================================================================== */}
        <motion.section
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mb-16"
        >
          <motion.div variants={fadeInUp} className="mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Scale className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">종합 비교</h2>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <SectionCard>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium">항목</th>
                      <th className="text-center py-3 px-4 font-medium text-orange-500">공랭</th>
                      <th className="text-center py-3 px-4 font-medium text-blue-500">수냉 (Cold Plate)</th>
                      <th className="text-center py-3 px-4 font-medium text-teal-500">침수냉각</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4 font-medium">열전달 계수</td>
                      <td className="text-center py-3 px-4">25~250 W/m²K</td>
                      <td className="text-center py-3 px-4">4,000~5,000 W/m²K</td>
                      <td className="text-center py-3 px-4 text-emerald-500">15,000~20,000 W/m²K</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4 font-medium">최대 Heat Flux</td>
                      <td className="text-center py-3 px-4">~30 W/cm²</td>
                      <td className="text-center py-3 px-4">~100 W/cm²</td>
                      <td className="text-center py-3 px-4 text-emerald-500">~250 W/cm²</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4 font-medium">PUE 범위</td>
                      <td className="text-center py-3 px-4 text-red-500">1.5~2.0</td>
                      <td className="text-center py-3 px-4 text-amber-500">1.1~1.4</td>
                      <td className="text-center py-3 px-4 text-emerald-500">1.02~1.15</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4 font-medium">초기 비용</td>
                      <td className="text-center py-3 px-4 text-emerald-500">낮음</td>
                      <td className="text-center py-3 px-4 text-amber-500">중간</td>
                      <td className="text-center py-3 px-4 text-red-500">높음</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4 font-medium">운영 비용 (에너지)</td>
                      <td className="text-center py-3 px-4 text-red-500">높음</td>
                      <td className="text-center py-3 px-4 text-amber-500">중간</td>
                      <td className="text-center py-3 px-4 text-emerald-500">낮음</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4 font-medium">소음</td>
                      <td className="text-center py-3 px-4 text-red-500">높음</td>
                      <td className="text-center py-3 px-4 text-amber-500">낮음</td>
                      <td className="text-center py-3 px-4 text-emerald-500">없음</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">적합 용도</td>
                      <td className="text-center py-3 px-4 text-xs">일반 서버, 데스크탑</td>
                      <td className="text-center py-3 px-4 text-xs">고성능 서버, 워크스테이션</td>
                      <td className="text-center py-3 px-4 text-xs">AI/HPC, 초고밀도 컴퓨팅</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </motion.div>
        </motion.section>

        {/* ================================================================== */}
        {/* CTA */}
        {/* ================================================================== */}
        <motion.section
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mb-16"
        >
          <SectionCard className="text-center bg-gradient-to-br from-primary/10 to-transparent border-primary/30">
            <h3 className="text-xl font-bold mb-3">
              내 칩에 어떤 냉각 방식이 적합할까?
            </h3>
            <p className="text-muted-foreground mb-6">
              TDP, 칩 면적, 주변 온도를 입력하여 각 냉각 방식의 성능을 비교해보세요.
            </p>
            <Link href="/comparison">
              <Button size="lg" className="gap-2">
                냉각 방식 비교하기
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </SectionCard>
        </motion.section>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-muted-foreground pt-8 border-t border-border/50"
        >
          <p>MFTEL Lab // Inha University // Prof. Il Woong Park</p>
          <p className="mt-1">Multiphase Flow and Thermal Engineering Laboratory</p>
        </motion.footer>
      </div>
    </AppShell>
  );
}
