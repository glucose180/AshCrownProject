# 겨울성으로 가는 길 · GitHub Pages 배포 안내

2026년 10월 3일 기준 게임 파일입니다. HTML·CSS·JavaScript와 지도 라이브러리·폰트를 모두 포함합니다. 별도 설치나 빌드 없이 GitHub Pages에 올릴 수 있습니다.

## 1. 압축 풀기

`winter-letter-github-pages.zip`을 내려받아 압축을 풉니다.
`index.html`이 보이는 폴더를 엽니다. **이 폴더 안의 파일과 하위 폴더 전체**를 GitHub에 올립니다.

ZIP 파일 자체를 올리거나, 압축을 푼 바깥 폴더를 통째로 올리지 않습니다. 저장소 첫 화면에 `index.html`이 바로 보여야 합니다.

## 2. GitHub 저장소 만들기

1. GitHub에 로그인하고 <https://github.com/new>를 엽니다.
2. 저장소 이름을 입력합니다. 예: `winter-letter`.
3. **Public**을 선택합니다. GitHub Free에서 Pages를 쓰려면 공개 저장소가 필요합니다.
4. **Add README**를 켜서 기본 브랜치를 만듭니다.
5. **Create repository**를 누릅니다.

저장소 이름은 나중에 게임 주소의 마지막 부분이 됩니다. 영문 소문자와 하이픈을 쓰면 관리하기 편합니다.

## 3. 게임 파일 올리기

1. 저장소의 **Code** 화면에서 **Add file → Upload files**를 엽니다.
2. 압축을 푼 폴더 안의 파일과 폴더를 전부 선택해 업로드 영역에 끌어놓습니다. `fonts`와 `vendor` 폴더도 포함합니다.
3. 업로드가 끝나면 변경 내용에 `Add game files` 등을 입력합니다.
4. `main` 브랜치에 직접 저장하도록 선택하고 **Commit changes**를 누릅니다. 기본 브랜치 이름이 다르면 해당 이름을 사용합니다.

업로드 후 저장소 첫 화면에서 아래 항목을 확인합니다.

| 항목 | 역할 |
| --- | --- |
| `index.html` | 게임 시작 화면 |
| `style.css` | 화면 배치와 글꼴 설정 |
| `map.js` | 지도와 이동 처리 |
| `story.js` | 지문·대사·선택지·분기 |
| `figures.js` | 3D 캐릭터 기물 |
| `fonts/` | 게임에서 사용하는 글꼴 |
| `vendor/` | 지도 라이브러리와 라이선스 |
| `.nojekyll` | 파일을 그대로 배포하기 위한 설정 |
| `README.md` | 이 안내문 |

## 4. Pages 켜기

1. 저장소의 **Settings → Pages**로 들어갑니다.
2. **Build and deployment → Source**에서 **Deploy from a branch**를 선택합니다.
3. **Branch**는 `main`, 폴더는 **/(root)**로 지정합니다. 기본 브랜치가 다른 이름이면 그 이름을 선택합니다.
4. **Save**를 누릅니다.
5. **Actions**에서 `pages build and deployment` 작업이 성공했는지 확인합니다. 완료까지 몇 분 걸릴 수 있습니다.
6. **Settings → Pages**에 표시되는 사이트 링크 또는 **Visit site**로 게임을 엽니다.

주소는 `https://깃허브아이디.github.io/저장소이름/` 형태입니다. 예를 들어 저장소 이름을 `winter-letter`로 정하면 마지막 경로가 `/winter-letter/`가 됩니다. 친구에게는 저장소 주소가 아니라 이 게임 주소를 보냅니다.

이 주소를 쓸 때 **Custom domain은 비워 둡니다.** 방문자는 GitHub나 ChatGPT 로그인 없이 플레이할 수 있습니다.

## 5. 배포 후 확인

- 이름을 비우고 시작하면 플레이어 이름이 `당신`으로 표시되는지 확인합니다.
- 지도와 글꼴이 표시되고 이동 지점을 눌렀을 때 기물이 움직이는지 확인합니다.
- 캐릭터를 만나 대사와 선택지가 나오는지 확인합니다.
- 산제이에게 서신을 맡기면 성공이 표시되고 이후 머무르기·떠나기를 선택할 수 있는지 확인합니다.
- 휴대폰에서도 게임 주소를 열어 봅니다.

## 이후 수정 파일 반영하기

새 파일을 받으면 같은 저장소의 **Add file → Upload files**에서 같은 위치에 덮어쓰고 커밋합니다. Pages 설정을 다시 할 필요는 없습니다. 이 대화에서 수정한 게임이 GitHub에도 자동 반영되는 것은 아니므로, 새 배포 파일을 올려야 합니다.

삭제되거나 이름이 바뀐 파일이 있으면 저장소에서도 해당 변경을 반영합니다.

## 자주 막히는 부분

| 증상 | 확인할 것 |
| --- | --- |
| 404 화면 | Actions의 배포 완료 여부와 `main` / `/(root)` 설정을 확인합니다. |
| 게임 대신 안내문이 보임 | `index.html`이 저장소 최상위에 있는지 확인합니다. |
| 지도나 글꼴이 안 보임 | `fonts/`, `vendor/` 폴더를 빠뜨리지 않았는지, 파일명 대소문자를 바꾸지 않았는지 확인합니다. |
| 예전 내용이 보임 | 최신 배포 성공 후 `Ctrl+F5`로 새로고침하거나 새 시크릿 창에서 엽니다. |
| PC에서 `index.html`을 더블클릭하면 안 됨 | 이 게임은 JavaScript 모듈을 사용합니다. GitHub Pages의 웹 주소에서 실행합니다. |

## 포함 버전

- 산제이와 샤르만의 3D 기물 및 머리 장식 제거 반영
- 동행인이 있을 때 합류 거절 선택지 변경 반영
- 지정된 두 대사의 줄바꿈 제거 반영
- “그 일로 보내신 편지일지도 모르겠네요.” 수정 반영

게임 파일은 현재 공개된 시험판과 동일합니다. Three.js 저작권 및 이용허락 문구는 `vendor/THREE-LICENSE.txt`에 포함되어 있습니다.

## 공식 안내

- [GitHub Pages 소개와 무료 계정 조건](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- [저장소에 파일 올리기](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)
- [Pages 배포 브랜치 설정](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
