import type { AiAnalysis, MeatType } from "./schema";

// 데모 모드: public/samples/*.svg 일러스트와 좌표가 맞는 AI 원시 응답.
// 실제 응답과 같은 스키마·점수 계산을 그대로 통과한다.

const BOX = {
  leftTop: [67, 40, 467, 480],
  rightTop: [93, 520, 493, 960],
  bottom: [547, 280, 947, 720],
} as const satisfies Record<string, [number, number, number, number]>;

export const SAMPLE_IMAGE: Record<MeatType, string> = {
  pork_belly: "/samples/pork_belly.svg",
  pork_neck: "/samples/pork_neck.svg",
  chuck_eye_roll: "/samples/chuck_eye_roll.svg",
};

export const MOCK_ANALYSIS: Record<MeatType, AiAnalysis> = {
  pork_belly: {
    isValidInput: true,
    rejectReason: null,
    detectedMeatType: "pork_belly",
    packs: [
      {
        id: 1,
        box2d: [...BOX.leftTop],
        positionLabel: "왼쪽 위",
        metrics: { leanPercent: 55, marblingScore: 55, royalPartScore: 60, defectScore: 50 },
        confidence: 0.85,
        warnings: [],
        pros: ["두께가 일정하게 썰려 있음"],
        cons: ["위·아래 가장자리에 지방이 두껍게 뭉친 떡지방 층이 있음"],
        oneLiner: "지방층이 한쪽으로 몰려 있어 구이보다 수육에 어울려요.",
        recommendedUse: "BRAISE",
        trimmingGuide:
          "가장자리 두꺼운 지방층을 1cm 정도만 남기고 잘라내세요. 통으로 삶는 수육이라면 지방을 그대로 두는 편이 촉촉합니다.",
      },
      {
        id: 2,
        box2d: [...BOX.rightTop],
        positionLabel: "오른쪽 위",
        metrics: { leanPercent: 70, marblingScore: 88, royalPartScore: 85, defectScore: 12 },
        confidence: 0.78,
        warnings: ["GLARE"],
        pros: ["살코기와 지방이 7:3에 가깝게 얇은 층으로 고르게 반복됨", "층 간격이 촘촘한 갈비 쪽 단면으로 보임"],
        cons: ["가운데 비닐 반사로 일부 층이 가려 보임"],
        oneLiner: "층이 고르고 비율이 황금비에 가까워 이 매대의 로얄팩이에요.",
        recommendedUse: "GRILL",
        trimmingGuide:
          "오돌뼈가 씹히는 부분은 가위로 칼집을 2~3번 넣어 주세요. 센 불에 지방면부터 구워 기름을 낸 뒤 뒤집으면 바삭합니다.",
      },
      {
        id: 3,
        box2d: [...BOX.bottom],
        positionLabel: "아래 가운데",
        metrics: { leanPercent: 88, marblingScore: 35, royalPartScore: 30, defectScore: 45 },
        confidence: 0.62,
        warnings: ["STICKER_OCCLUSION"],
        pros: ["기름이 적어 담백함"],
        cons: ["살코기 위주라 구우면 퍽퍽해지기 쉬운 끝 부위로 보임", "가격표가 오른쪽 아래 지방층을 가리고 있음"],
        oneLiner: "살코기만 많은 끝 부위라 구이로는 아쉬워요. 스티커 아래도 확인해 보세요.",
        recommendedUse: "STIR_FRY",
        trimmingGuide: "한입 크기로 잘라 제육볶음처럼 양념해 볶으면 퍽퍽함이 덜합니다.",
      },
    ],
  },

  pork_neck: {
    isValidInput: true,
    rejectReason: null,
    detectedMeatType: "pork_neck",
    packs: [
      {
        id: 1,
        box2d: [...BOX.leftTop],
        positionLabel: "왼쪽 위",
        metrics: { leanPercent: 76, marblingScore: 86, royalPartScore: 90, defectScore: 10 },
        confidence: 0.9,
        warnings: [],
        pros: ["굵은 알목심 근육이 뚜렷한 꽃목살 형태", "근육 사이 지방선이 잔잔하게 고루 퍼짐"],
        cons: [],
        oneLiner: "알목심이 크고 지방선이 고르게 퍼진 전형적인 꽃목살이에요.",
        recommendedUse: "GRILL",
        trimmingGuide:
          "근육 경계의 굵은 지방선을 따라 칼집을 얕게 넣으면 구울 때 말리지 않아요. 두께 2cm 이상이면 겉면을 굽고 약불로 속을 익히세요.",
      },
      {
        id: 2,
        box2d: [...BOX.rightTop],
        positionLabel: "오른쪽 위",
        metrics: { leanPercent: 80, marblingScore: 40, royalPartScore: 25, defectScore: 55 },
        confidence: 0.7,
        warnings: ["STICKER_OCCLUSION"],
        pros: ["조각이 작아 바로 볶기 좋음"],
        cons: ["살코기가 여러 조각으로 찢어져 있음", "가격표가 오른쪽 위 조각을 가림"],
        oneLiner: "자투리 조각이 섞인 팩이라 구이용으로는 추천하지 않아요.",
        recommendedUse: "STIR_FRY",
        trimmingGuide: "조각 크기를 맞춰 썰어 고추장 양념 볶음이나 찌개용으로 쓰세요.",
      },
      {
        id: 3,
        box2d: [...BOX.bottom],
        positionLabel: "아래 가운데",
        metrics: { leanPercent: 62, marblingScore: 50, royalPartScore: 70, defectScore: 40 },
        confidence: 0.85,
        warnings: [],
        pros: ["근육 덩어리 자체는 큼직함"],
        cons: ["한쪽에 두꺼운 겉지방이 몰려 있음", "속 지방선이 적어 식감이 단단할 수 있음"],
        oneLiner: "겉지방만 손질하면 무난하지만 꽃목살 느낌은 약해요.",
        recommendedUse: "BRAISE",
        trimmingGuide: "오른쪽 흰 겉지방을 5mm만 남기고 잘라내세요. 수육이나 보쌈으로 삶으면 단단한 식감이 장점이 됩니다.",
      },
    ],
  },

  chuck_eye_roll: {
    isValidInput: true,
    rejectReason: null,
    detectedMeatType: "chuck_eye_roll",
    packs: [
      {
        id: 1,
        box2d: [...BOX.leftTop],
        positionLabel: "왼쪽 위",
        metrics: { leanPercent: 85, marblingScore: 45, royalPartScore: 30, defectScore: 65 },
        confidence: 0.85,
        warnings: [],
        pros: ["살코기 양이 많음"],
        cons: ["두꺼운 흰 힘줄(근막)이 단면을 가로지름", "잔근육이 많은 목심 쪽 단면으로 보임"],
        oneLiner: "힘줄이 가로지르는 목심 쪽이라 구이보다는 국거리에 적합해요.",
        recommendedUse: "STEW",
        trimmingGuide: "흰 힘줄을 따라 칼을 넣어 걷어내고, 깍둑 썰어 국·찌개용으로 오래 끓이세요.",
      },
      {
        id: 2,
        box2d: [...BOX.rightTop],
        positionLabel: "오른쪽 위",
        metrics: { leanPercent: 70, marblingScore: 60, royalPartScore: 62, defectScore: 50 },
        confidence: 0.75,
        warnings: ["STICKER_OCCLUSION"],
        pros: ["마블링이 단면 전체에 고루 있음"],
        cons: ["중앙에 큰 떡지방이 박혀 있음", "가격표가 오른쪽 아래를 가림"],
        oneLiner: "마블링은 괜찮지만 가운데 떡지방 때문에 버리는 양이 생겨요.",
        recommendedUse: "GRILL",
        trimmingGuide: "가운데 흰 떡지방을 가위로 둥글게 도려내 팬 기름칠용으로 쓰세요. 남은 고기는 결 반대로 썰어 구우세요.",
      },
      {
        id: 3,
        box2d: [...BOX.bottom],
        positionLabel: "아래 가운데",
        metrics: { leanPercent: 72, marblingScore: 92, royalPartScore: 90, defectScore: 15 },
        confidence: 0.8,
        warnings: ["GLARE"],
        pros: ["위쪽 가장자리에 마블링 촘촘한 살치살 면적이 넓음", "알등심이 둥글고 뚜렷하며 근육 사이 벌어짐이 없음"],
        cons: ["오른쪽 비닐 반사로 일부 마블링이 덜 보임"],
        oneLiner: "살치살이 넓고 알등심이 뚜렷한 꽃등심 쪽 단면, 오늘의 로얄팩이에요.",
        recommendedUse: "GRILL",
        trimmingGuide:
          "살치살 쪽 가장자리 지방은 남기고, 알등심과 경계의 얇은 막만 칼끝으로 걷어내세요. 살치살 부위부터 먼저 구워 드세요.",
      },
    ],
  },
};
