"""활동목록 엑셀 → activities.json 변환
사용: python3 convert.py 활동목록.xlsx src/data/activities.json
금액·비고·재방문의사는 공개 제외 컬럼이므로 출력하지 않는다.
"""
import sys, json
import pandas as pd

src = sys.argv[1] if len(sys.argv) > 1 else "활동목록.xlsx"
dst = sys.argv[2] if len(sys.argv) > 2 else "activities.json"

df = pd.read_excel(src)
df = df[df["업체명"].notna()].copy()

recs = [{
    "id": int(r["순번"]),
    "ym": f'{int(r["연"])}-{int(r["월"]):02d}',
    "type": str(r["유형"]).strip(),
    "name": str(r["업체명"]).strip(),
    "platform": str(r["채널"]).strip() if pd.notna(r["채널"]) else "",
} for _, r in df.iterrows()]

json.dump(recs, open(dst, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"{len(recs)}건 → {dst}")
