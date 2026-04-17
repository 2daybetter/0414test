"""
예다함 프로젝트 산출물 일괄 생성 스크립트
Run: python scripts/run_예다함.py
"""
import sys, os

# 스크립트 파일 기준으로 절대 경로 계산
THIS_DIR  = os.path.dirname(os.path.abspath(__file__))
BASE_DIR  = os.path.dirname(THIS_DIR)          # 아데오 에이전트 시스템/
GEN_DIR   = os.path.join(THIS_DIR, "generators")
OUT_BASE  = os.path.join(BASE_DIR, "output", "구축 파트", "예다함")

sys.path.insert(0, GEN_DIR)

import importlib.util

def load_gen(name):
    path = os.path.join(GEN_DIR, name)
    spec = importlib.util.spec_from_file_location(name, path)
    mod  = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


TASKS = [
    ("gen_wbs.py",
     os.path.join(OUT_BASE, "PM", "_wbs-data.json"),
     os.path.join(OUT_BASE, "PM", "kickoff-예다함.xlsx")),

    ("gen_requirements.py",
     os.path.join(OUT_BASE, "웹기획팀", "_requirements-data.json"),
     os.path.join(OUT_BASE, "웹기획팀", "요구사항정의서-예다함.xlsx")),

    ("gen_ia.py",
     os.path.join(OUT_BASE, "웹기획팀", "_ia-data.json"),
     os.path.join(OUT_BASE, "웹기획팀", "ia-예다함.xlsx")),

    ("gen_wireframe.py",
     os.path.join(OUT_BASE, "웹기획팀", "_wireframe-data.json"),
     os.path.join(OUT_BASE, "웹기획팀", "화면설계서-예다함.pptx")),
]


if __name__ == "__main__":
    for gen_file, data_path, output_path in TASKS:
        print(f"\n[실행] {gen_file}")
        print(f"      입력: {data_path}")
        print(f"      출력: {output_path}")
        try:
            mod = load_gen(gen_file)
            mod.generate(data_path, output_path)
        except Exception as e:
            print(f"[오류] {e}")
            import traceback; traceback.print_exc()

    print("\n=== 완료 ===")
