# Purposeful Mobile - iOS Widget App

React Native 앱과 iOS 위젯을 통해 목표 관리를 더욱 편리하게!

## 🎯 주요 기능

### 📱 **모바일 앱**
- 웹 버전과 동일한 모든 기능
- 터치 최적화된 인터페이스
- 오프라인 지원
- 푸시 알림

### 🏠 **iOS 위젯**
- **Small Widget**: 오늘의 진행률과 주요 태스크 3개
- **Medium Widget**: 오늘의 모든 태스크 (최대 5개)
- **Large Widget**: 전체 태스크 목록과 진행률 바

## 🚀 개발 환경 설정

### 1. 필수 요구사항
```bash
# Node.js 18+
# Xcode 15+ (iOS 개발용)
# iOS Developer Account ($99/년)
```

### 2. 프로젝트 설정
```bash
cd mobile
npm install
npx expo install
```

### 3. iOS 개발 설정
```bash
# iOS 시뮬레이터에서 실행
npm run ios

# 실제 기기에서 테스트
expo run:ios --device
```

### 4. 위젯 개발
```bash
# Xcode에서 위젯 타겟 추가
# ios/PurposefulWidget 폴더의 Swift 파일들 사용
```

## 📋 위젯 구현 상세

### **Small Widget (2x2)**
- 오늘 날짜와 완료율
- 미완료 태스크 3개 표시
- 추가 태스크 개수 표시

### **Medium Widget (4x2)**
- 완료율과 체크박스
- 최대 5개 태스크 표시
- 완료/미완료 상태 구분

### **Large Widget (4x4)**
- 진행률 바
- 모든 태스크 표시
- 상세한 완료 상태

## 🔄 데이터 동기화

### **App Groups 설정**
```swift
// iOS App Groups를 통한 데이터 공유
let sharedDefaults = UserDefaults(suiteName: "group.com.purposeful.goals")
```

### **위젯 업데이트**
```swift
// 앱에서 데이터 변경 시 위젯 새로고침
WidgetCenter.shared.reloadAllTimelines()
```

## 📦 배포 과정

### 1. 앱스토어 준비
```bash
# 프로덕션 빌드
eas build --platform ios --profile production

# 앱스토어 제출
eas submit --platform ios
```

### 2. 위젯 테스트
- iOS 시뮬레이터에서 위젯 추가
- 다양한 크기별 테스트
- 데이터 업데이트 확인

## 🎨 위젯 디자인 가이드

### **색상 시스템**
- Primary Blue: #3B82F6
- Success Green: #10B981
- Text Gray: #111827
- Secondary Gray: #6B7280

### **타이포그래피**
- Title: SF Pro Display, 18-20pt, Semibold
- Body: SF Pro Text, 13-14pt, Regular
- Caption: SF Pro Text, 11-12pt, Regular

### **레이아웃**
- 패딩: 12-20pt (크기별 조정)
- 간격: 4-12pt
- 모서리 반경: 8pt

## 🔧 개발 팁

### **위젯 디버깅**
```swift
// 위젯 시뮬레이터에서 디버깅
#if DEBUG
print("Widget data: \(tasks)")
#endif
```

### **성능 최적화**
- 위젯은 메모리 제한이 있음 (16MB)
- 복잡한 애니메이션 피하기
- 이미지 크기 최적화

### **사용자 경험**
- 위젯 탭 시 앱의 해당 화면으로 이동
- 로딩 상태 표시
- 오류 상태 처리

이제 진짜 iOS 위젯으로 홈 화면에서 바로 목표를 확인할 수 있습니다! 🎉