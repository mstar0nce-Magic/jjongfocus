# 쫑포커스 v0.1.0

머릿속 생각과 스크린샷을 Inbox에 넣고, 지금 할 일 하나(NOW)에만 집중하도록 만든 개인 생산성 PWA입니다.

## 핵심 원칙
- 저장은 무제한, 실행은 하나.
- 생각나면 저장하고 현재 작업은 바꾸지 않기.
- 큰 일은 바로 실행할 수 있는 첫 행동까지 작게 만들기.

## 현재 구현
- 빠른 메모 저장
- 스크린샷 여러 장 저장
- 3분 브레인덤프
- Inbox / NOW 1개 / 완료 흐름
- NOW 작업의 첫 행동(Next Action) 메모
- 10/15/25분 집중 타이머
- 작업 중 떠오른 생각을 Inbox에 빠르게 저장
- JSON 백업/복원
- 반응형 PC/모바일 UI
- PWA manifest + service worker 오프라인 캐시
- localStorage 기반 기기별 저장

## Cloudflare Pages + GitHub 자동배포

이 저장소는 별도 빌드가 필요 없는 정적 웹앱입니다.

### 1. GitHub 저장소 만들기
1. GitHub에서 새 Repository를 만듭니다. 예: `jjongfocus`
2. 이 폴더의 **내용물 전체**를 저장소 최상위(root)에 업로드합니다.
3. 기본 브랜치는 `main`으로 사용합니다.

저장소 최상위에 아래 파일들이 바로 보여야 합니다.

```text
index.html
styles.css
app.js
manifest.webmanifest
sw.js
icons/
README.md
CHANGELOG.md
.gitignore
```

### 2. Cloudflare Pages 연결
1. Cloudflare Dashboard → Workers & Pages
2. Create application → Pages → Connect to Git
3. GitHub 권한을 연결하고 `jjongfocus` 저장소 선택
4. Production branch: `main`
5. Framework preset: `None`
6. Build command: 비워두기
7. Build output directory: `.`
8. Save and Deploy

배포가 끝나면 `https://프로젝트명.pages.dev` 주소가 생성됩니다.

### 3. 이후 버전 업데이트
앞으로 `main` 브랜치에 변경사항을 push하면 Cloudflare Pages가 자동으로 새 버전을 배포합니다.

권장 흐름:

```text
코드 수정
→ GitHub에 commit / push
→ Cloudflare 자동 감지
→ 자동 배포
→ 기존 pages.dev 주소에 최신 버전 반영
```

테스트 버전은 별도 브랜치에서 작업하면 Cloudflare의 Preview Deployment URL로 먼저 확인할 수 있습니다.

## 로컬 테스트
PWA 기능은 HTTPS 또는 localhost에서 정상 동작합니다.

```bash
python -m http.server 8080
```

그 뒤 브라우저에서 `http://localhost:8080` 으로 접속합니다.

## 데이터 주의
v0.1은 `localStorage`를 사용하므로 PC와 휴대폰 데이터는 아직 자동 동기화되지 않습니다.
브라우저 데이터 삭제 시 내용이 사라질 수 있으므로 중요한 데이터는 설정의 JSON 백업 기능을 사용하세요.

## 다음 단계 v0.2
- Supabase 로그인 / 클라우드 동기화
- 이미지 저장소를 Supabase Storage로 이동
- PC ↔ 휴대폰 실시간 반영
- AI 이미지/텍스트 분류
- AI 제목/카테고리/Next Action 추천
- Android 공유 메뉴(스크린샷 → 쫑포커스)
- 전체 지도(마인드맵) / 목표 지도(만다라트)
