import ActivityKit
import SwiftUI
import WidgetKit
import UIKit

// MARK: - Timeline Entry

struct YearProgressEntry: TimelineEntry {
    let date: Date
    let daysPassed: Int
    let daysLeft: Int
    let totalDays: Int
    let percentage: Double
    /// Percentage of the current 24h day already completed (0–100). Remaining = 100 - dayProgressPercentage.
    let dayProgressPercentage: Double
}

// MARK: - Timeline Provider

struct YearProgressProvider: TimelineProvider {
    func placeholder(in context: Context) -> YearProgressEntry {
        YearProgressEntry(
            date: Date(),
            daysPassed: 30,
            daysLeft: 335,
            totalDays: 365,
            percentage: 8.2,
            dayProgressPercentage: 42.5
)
    }

    func getSnapshot(in context: Context, completion: @escaping (YearProgressEntry) -> Void) {
        completion(makeEntry(for: Date()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<YearProgressEntry>) -> Void) {
        let now = Date()
        let calendar = Calendar.current
        let entry = makeEntry(for: now)
        // Refresh at start of next hour so "today %" updates through the day, and at midnight for day rollover
        let hourComponents = calendar.dateComponents([.year, .month, .day, .hour], from: now)
        let startOfCurrentHour = calendar.date(from: hourComponents) ?? now
        let startOfNextHour = calendar.date(byAdding: .hour, value: 1, to: startOfCurrentHour) ?? now
        let startOfTomorrow = calendar.startOfDay(for: calendar.date(byAdding: .day, value: 1, to: now)!)
        let nextRefresh = min(startOfNextHour, startOfTomorrow)
        let timeline = Timeline(entries: [entry], policy: .after(nextRefresh))
        completion(timeline)
    }

    private func makeEntry(for date: Date) -> YearProgressEntry {
        let calendar = Calendar.current
        let year = calendar.component(.year, from: date)
        let dayOfYear = calendar.ordinality(of: .day, in: .year, for: date) ?? 1
        var endOfYear = DateComponents()
        endOfYear.year = year
        endOfYear.month = 12
        endOfYear.day = 31
        let lastDay = calendar.date(from: endOfYear)!
        let totalDays = calendar.ordinality(of: .day, in: .year, for: lastDay) ?? 365
        let daysPassed = dayOfYear
        let daysLeft = totalDays - daysPassed
        let percentage = totalDays > 0 ? (Double(daysPassed) / Double(totalDays)) * 100 : 0
        // Present day: % of current 24h day completed (0–100)
        let startOfDay = calendar.startOfDay(for: date)
        let elapsedInDay = date.timeIntervalSince(startOfDay)
        let secondsPerDay = 24.0 * 60.0 * 60.0
        let dayProgressPercentage = min(100, max(0, (elapsedInDay / secondsPerDay) * 100))
        return YearProgressEntry(
            date: date,
            daysPassed: daysPassed,
            daysLeft: daysLeft,
            totalDays: totalDays,
            percentage: percentage,
            dayProgressPercentage: dayProgressPercentage
        )
    }
}

// MARK: - Colors (match Android) — explicit SwiftUI.Color to avoid overload ambiguity

private let widgetPurple: SwiftUI.Color = SwiftUI.Color(red: 187/255, green: 134/255, blue: 252/255)  // #BB86FC
private let widgetDotMuted: SwiftUI.Color = SwiftUI.Color(red: 51/255, green: 51/255, blue: 51/255)    // #333333
private let widgetSubtitleGray: SwiftUI.Color = SwiftUI.Color(red: 128/255, green: 128/255, blue: 128/255) // #808080

// MARK: - Psychology-based colors for Live Activity (work on light and dark)
// Days passed: Red - urgency, time gone
private let daysPassedRed: SwiftUI.Color = SwiftUI.Color(red: 239/255, green: 68/255, blue: 68/255)  // #EF4444
// Days left: Green - opportunity, future
private let daysLeftGreen: SwiftUI.Color = SwiftUI.Color(red: 16/255, green: 185/255, blue: 129/255)  // #10B981
// Percentage: Amber - progress
private let percentageAmber: SwiftUI.Color = SwiftUI.Color(red: 245/255, green: 158/255, blue: 11/255)  // #F59E0B

/// Year as plain string (no locale thousands separator — show 2026 not 2,026)
private func yearString(_ year: Int) -> String { String(year) }

/// Month name abbreviation (Jan, Feb, Mar, etc.)
private func monthName(_ month: Int) -> String {
    let formatter = DateFormatter()
    formatter.dateFormat = "MMM"
    let calendar = Calendar.current
    var components = DateComponents()
    components.month = month
    components.day = 1
    if let date = calendar.date(from: components) {
        return formatter.string(from: date)
    }
    return "Month"
}

/// Get pet emoji based on type
private func getPetEmoji(type: String) -> String {
    switch type {
    case "cat": return "🐱"
    case "dog": return "🐶"
    case "rabbit": return "🐰"
    case "bird": return "🐦"
    default: return "🐾"
    }
}

/// Get pet status emoji based on stats
private func getPetStatusEmoji(hunger: Int, happiness: Int, energy: Int) -> String {
    if hunger < 30 { return "😋" } // Hungry
    if happiness < 30 { return "😢" } // Sad
    if energy < 30 { return "😴" } // Tired
    return "😊" // Happy
}

/// Get pet status text
private func getPetStatusText(hunger: Int, happiness: Int, energy: Int) -> String {
    if hunger < 30 { return "Hungry" }
    if happiness < 30 { return "Sad" }
    if energy < 30 { return "Tired" }
    return "Happy"
}

/// Size variant for pixel pet (emoji fallback until assets are added)
private enum PetViewSize {
    case compact
    case minimal
    case expanded
    case lockScreen
    var fontSize: CGFloat {
        switch self {
        case .compact, .minimal: return 16
        case .expanded: return 32
        case .lockScreen: return 14
        }
    }
}

/// Pixel-style pet view: uses petCurrentAction for animation state; loads PNG from PetAssets or falls back to emoji.
private struct PixelPetView: View {
    let state: YearProgressContentState
    let size: PetViewSize
    private var action: String {
        let raw = state.petCurrentAction ?? "idle"
        if raw == "idle" {
            let h = state.petHunger ?? 50
            let hp = state.petHappiness ?? 50
            if h < 30 || hp < 30 { return "sad" }
        }
        return raw
    }
    private var petType: String { state.petType ?? "cat" }
    private var hunger: Int { state.petHunger ?? 50 }
    private var happiness: Int { state.petHappiness ?? 50 }
    var body: some View {
        TimelineView(.animation(minimumInterval: 0.25)) { timeline in
            let frameIndex = frameIndexFor(action: action, date: timeline.date)
            let scale = scaleForAction(action)
            let imageName = "pet_\(petType)_\(action)_\(frameIndex)"
            if let uiImage = petImage(named: imageName) {
                Image(uiImage: uiImage)
                    .resizable()
                    .scaledToFit()
                    .frame(width: size.fontSize * 2, height: size.fontSize * 2)
                    .scaleEffect(scale)
                    .animation(.easeInOut(duration: 0.2), value: frameIndex)
            } else {
                Text(getPetEmoji(type: petType))
                    .font(.system(size: size.fontSize))
                    .scaleEffect(scale)
                    .animation(.easeInOut(duration: 0.2), value: frameIndex)
            }
        }
    }
    private func petImage(named name: String) -> UIImage? {
        guard let path = Bundle.main.path(forResource: name, ofType: "png", inDirectory: "PetAssets") else { return nil }
        return UIImage(contentsOfFile: path)
    }
    private func frameIndexFor(action: String, date: Date) -> Int {
        let counts: [String: Int] = ["idle": 4, "eating": 3, "playing": 3, "sleeping": 2, "sad": 2, "waving": 2]
        let count = counts[action] ?? 4
        let step = Int(date.timeIntervalSince1970 * 4) % max(1, count)
        return step + 1
    }
    private func scaleForAction(_ action: String) -> CGFloat {
        switch action {
        case "eating": return 1.15
        case "playing": return 1.1
        case "waving": return 1.08
        default: return 1.0
        }
    }
}

/// Format relative date (e.g. "2h ago", "3d ago") — used outside ViewBuilder to avoid "Type '()' cannot conform to 'View'"
private func formatRelativeDate(_ date: Date) -> String {
    let formatter = RelativeDateTimeFormatter()
    formatter.unitsStyle = .abbreviated
    return formatter.localizedString(for: date, relativeTo: Date())
}

// MARK: - Widget View

struct YearProgressWidgetView: View {
    var entry: YearProgressEntry
    @Environment(\.widgetFamily) var family

    // Grid layout: Large = 365 days, Small/Medium = 12 months
    private var cols: Int {
        isLarge ? 25 : 6  // 25 cols for 365 days (~15 rows), 6 cols for 12 months (2 rows)
    }
    private var totalDots: Int {
        isLarge ? entry.totalDays : 12  // 365 days for large, 12 months for small
    }

    @ViewBuilder
    var body: some View {
        if #available(iOS 16.0, *) {
            switch family {
            case .accessoryRectangular:
                lockScreenView
            case .accessoryCircular:
                lockScreenCircularView
            case .accessoryInline:
                lockScreenInlineView
            default:
                homeScreenView
            }
        } else {
            homeScreenView
        }
    }
    
    // MARK: - Home Screen View
    
    private var homeScreenView: some View {
        VStack(spacing: 0) {
            // Dot grid (365 days for large, 12 months for small)
            dotGrid
                .padding(.top, isLarge ? 12 : 8)
                .padding(.bottom, isLarge ? 10 : 8)
            
            // Progress bar
            progressBar
                .padding(.bottom, isLarge ? 16 : 10)

            // Days row: "30d passed" and "335d Left" with psychology-based colors
            HStack(spacing: isLarge ? 24 : 12) {
                Text("\(entry.daysPassed)d passed")
                    .font(.system(size: isLarge ? 24 : 16, weight: .bold))
                    .foregroundColor(daysPassedRed)
                Text("\(entry.daysLeft)d Left")
                    .font(.system(size: isLarge ? 24 : 16, weight: .bold))
                    .foregroundColor(daysLeftGreen)
            }
            .padding(.top, isLarge ? 16 : 8)

            // Percentage with attention-grabbing amber color
            Text(String(format: "%.1f%%", entry.percentage))
                .font(.system(size: isLarge ? 32 : 22, weight: .bold))
                .foregroundColor(percentageAmber)
                .padding(.top, isLarge ? 16 : 10)

            // Subtitle
            Text("of year")
                .font(.system(size: isLarge ? 16 : 12))
                .foregroundColor(widgetSubtitleGray)
                .padding(.top, isLarge ? 8 : 4)

            // Present day: % completed / % left
            HStack(spacing: isLarge ? 20 : 12) {
                HStack(spacing: 4) {
                    Text(String(format: "%.0f%%", entry.dayProgressPercentage))
                        .font(.system(size: isLarge ? 18 : 14, weight: .bold))
                        .foregroundColor(daysPassedRed)
                    Text("day done")
                        .font(.system(size: isLarge ? 14 : 11))
                        .foregroundColor(widgetSubtitleGray)
                }
                HStack(spacing: 4) {
                    Text(String(format: "%.0f%%", 100 - entry.dayProgressPercentage))
                        .font(.system(size: isLarge ? 18 : 14, weight: .bold))
                        .foregroundColor(daysLeftGreen)
                    Text("day left")
                        .font(.system(size: isLarge ? 14 : 11))
                        .foregroundColor(widgetSubtitleGray)
                }
            }
            .padding(.top, isLarge ? 14 : 8)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(isLarge ? 24 : 12)
        .widgetBackground(SwiftUI.Color.black)
        .widgetURL(URL(string: "wallpe://year-progress"))
    }
    
    // MARK: - Lock Screen Views (accessoryRectangular, accessoryCircular, accessoryInline)
    // Use AccessoryWidgetBackground so the widget is visible on the lock screen.
    
    private var lockScreenView: some View {
        ZStack {
            if #available(iOS 16.0, *) {
                AccessoryWidgetBackground()
            }
            VStack(alignment: .leading, spacing: 4) {
                // Colored progress bar (interactive feel)
                lockScreenProgressBar
                HStack(spacing: 6) {
                    Text("\(entry.daysPassed)d")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(daysPassedRed)
                    Text("passed")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.secondary)
                    Text("·")
                        .foregroundColor(.secondary)
                    Text("\(entry.daysLeft)d")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(daysLeftGreen)
                    Text("left")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.secondary)
                }
                HStack(spacing: 4) {
                    Text(String(format: "%.1f%%", entry.percentage))
                        .font(.system(size: 15, weight: .bold))
                        .foregroundColor(percentageAmber)
                    Text("of year \(yearString(Calendar.current.component(.year, from: entry.date)))")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.secondary)
                }
                // Today: X% done · Y% left
                HStack(spacing: 4) {
                    Text("Today:")
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(.secondary)
                    Text(String(format: "%.0f%%", entry.dayProgressPercentage))
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(daysPassedRed)
                    Text("done")
                        .font(.system(size: 11))
                        .foregroundColor(.secondary)
                    Text("·")
                        .foregroundColor(.secondary)
                    Text(String(format: "%.0f%%", 100 - entry.dayProgressPercentage))
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(daysLeftGreen)
                    Text("left")
                        .font(.system(size: 11))
                        .foregroundColor(.secondary)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
        }
    }
    
    private var lockScreenProgressBar: some View {
        let progress = min(1.0, max(0, entry.percentage / 100.0))
        return GeometryReader { geometry in
            ZStack(alignment: .leading) {
                RoundedRectangle(cornerRadius: 2)
                    .fill(widgetDotMuted.opacity(0.6))
                    .frame(height: 4)
                RoundedRectangle(cornerRadius: 2)
                    .fill(
                        LinearGradient(
                            colors: [daysPassedRed, percentageAmber],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .frame(width: max(4, geometry.size.width * progress), height: 4)
            }
        }
        .frame(height: 4)
    }
    
    private var lockScreenCircularView: some View {
        ZStack {
            if #available(iOS 16.0, *) {
                AccessoryWidgetBackground()
            }
            // Circular progress ring (percentage of year)
            lockScreenCircularProgressRing
            VStack(spacing: 1) {
                Text(String(format: "%.0f%%", entry.percentage))
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(percentageAmber)
                Text("\(entry.daysPassed)d")
                    .font(.system(size: 9, weight: .semibold))
                    .foregroundColor(daysPassedRed)
                Text(String(format: "%.0f%% day", entry.dayProgressPercentage))
                    .font(.system(size: 8, weight: .medium))
                    .foregroundColor(.secondary)
            }
            .padding(8)
        }
    }
    
    private var lockScreenCircularProgressRing: some View {
        let progress = min(1.0, max(0, entry.percentage / 100.0))
        let lineWidth: CGFloat = 3
        return ZStack {
            // Background ring (muted)
            Circle()
                .stroke(widgetDotMuted.opacity(0.6), lineWidth: lineWidth)
            // Progress arc — red (past) to amber (progress)
            Circle()
                .trim(from: 0, to: progress)
                .stroke(percentageAmber, style: StrokeStyle(lineWidth: lineWidth, lineCap: .round))
                .rotationEffect(.degrees(-90))
        }
        .padding(6)
    }
    
    private var lockScreenInlineView: some View {
        HStack(spacing: 5) {
            Text(String(format: "%.1f%%", entry.percentage))
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(percentageAmber)
            Text("year")
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.secondary)
            Text("·")
                .foregroundColor(.secondary)
            Text(String(format: "%.0f%%", entry.dayProgressPercentage))
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(daysPassedRed)
            Text("done")
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.secondary)
            Text(String(format: "%.0f%%", 100 - entry.dayProgressPercentage))
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(daysLeftGreen)
            Text("left today")
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.secondary)
        }
    }
    
    private var isLarge: Bool {
        family == .systemLarge
    }

    private func dotColor(forDay day: Int) -> SwiftUI.Color {
        if day <= entry.daysPassed { return widgetPurple }
        return widgetDotMuted
    }
    
    private func dotColor(forMonth month: Int) -> SwiftUI.Color {
        let calendar = Calendar.current
        let currentMonth = calendar.component(.month, from: entry.date)
        // Highlight past months and current month
        if month <= currentMonth { return widgetPurple }
        return widgetDotMuted
    }

    private var dotGrid: some View {
        let dotSize: CGFloat = isLarge ? 6 : 10  // Smaller dots for 365 days
        let spacing: CGFloat = isLarge ? 3 : 8   // Tighter spacing for 365 days
        let columns = Array(repeating: GridItem(.flexible(), spacing: spacing), count: cols)
        
        return LazyVGrid(columns: columns, spacing: spacing) {
            if isLarge {
                // Large widget: show 365 days
                ForEach(1...entry.totalDays, id: \.self) { day in
                    let fillColor: SwiftUI.Color = dotColor(forDay: day)
                    Circle()
                        .fill(fillColor)
                        .frame(width: dotSize, height: dotSize)
                }
            } else {
                // Small/Medium widget: show 12 months
                ForEach(1...12, id: \.self) { month in
                    let fillColor: SwiftUI.Color = dotColor(forMonth: month)
                    Circle()
                        .fill(fillColor)
                        .frame(width: dotSize, height: dotSize)
                }
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.horizontal, isLarge ? 4 : 4)
    }
    
    private var progressBar: some View {
        let progress = entry.percentage / 100.0
        let barHeight: CGFloat = isLarge ? 6 : 4
        
        return GeometryReader { geometry in
            ZStack(alignment: .leading) {
                // Background
                RoundedRectangle(cornerRadius: barHeight / 2)
                    .fill(widgetDotMuted)
                    .frame(height: barHeight)
                
                // Progress fill - using amber to match percentage color
                RoundedRectangle(cornerRadius: barHeight / 2)
                    .fill(percentageAmber)
                    .frame(width: geometry.size.width * progress, height: barHeight)
            }
        }
        .frame(height: barHeight)
        .padding(.horizontal, isLarge ? 8 : 4)
    }
}

// MARK: - View Extension for Background Compatibility

extension View {
    @ViewBuilder
    func widgetBackground(_ color: SwiftUI.Color) -> some View {
        if #available(iOS 17.0, *) {
            self.containerBackground(for: .widget) {
                color
            }
        } else {
            self.background(color)
        }
    }
}

// MARK: - Live Activity (Dynamic Island + Lock Screen)

struct YearProgressLiveActivityWidget: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: YearProgressActivityAttributes.self) { context in
            // Lock Screen
            lockScreenView(state: context.state, mode: context.attributes.mode)
                .widgetURL(context.attributes.mode == .pet ? URL(string: "wallpe://pet")! : URL(string: "wallpe://year-progress")!)
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    expandedLeading(state: context.state, mode: context.attributes.mode)
                        .padding(.top, 12)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    expandedTrailing(state: context.state, mode: context.attributes.mode)
                        .padding(.top, 12)
                }
                DynamicIslandExpandedRegion(.center) {
                    expandedCenter(state: context.state, mode: context.attributes.mode)
                        .padding(.top, 12)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    expandedBottom(state: context.state, mode: context.attributes.mode)
                        .padding(.top, 8)
                        .padding(.bottom, 4)
                }
            } compactLeading: {
                compactView(state: context.state, mode: context.attributes.mode, leading: true)
            } compactTrailing: {
                compactView(state: context.state, mode: context.attributes.mode, leading: false)
            } minimal: {
                minimalView(state: context.state, mode: context.attributes.mode)
            }
            .widgetURL(context.attributes.mode == .pet ? URL(string: "wallpe://pet")! : URL(string: "wallpe://year-progress")!)
        }
    }

    private func lockScreenView(state: YearProgressContentState, mode: LiveActivityMode) -> some View {
        return VStack(alignment: .leading, spacing: 4) {
            switch mode {
            case .yearProgress:
                HStack(spacing: 4) {
                    Text(yearString(state.year))
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.primary)
                    Text("·")
                        .foregroundColor(.secondary)
                    Text("\(Int(state.percentage))%")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(percentageAmber)
                }
                HStack(spacing: 6) {
                    Text("\(state.daysPassed) days passed")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(daysPassedRed)
                    Text("·")
                        .foregroundColor(.secondary)
                    Text("\(state.daysLeft) days left")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(daysLeftGreen)
                }
            case .countdown:
                Text(state.countdownLabel ?? "\(state.daysLeft) days left")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(daysLeftGreen)
                Text(yearString(state.year))
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.secondary)
            case .dayProgress:
                let dayPct = state.dayProgressPercentage ?? 0
                let dayLeft = 100 - dayPct
                Text("Today")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.secondary)
                HStack(spacing: 6) {
                    Text("\(Int(dayPct))% done")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(daysPassedRed)
                    Text("·")
                        .foregroundColor(.secondary)
                    Text("\(Int(dayLeft))% left")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(daysLeftGreen)
                }
            case .monthProgress:
                let month = state.month ?? 1
                let monthPct = Int(state.monthPercentage ?? 0)
                HStack(spacing: 4) {
                    Text(monthName(month))
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.primary)
                    Text("·")
                        .foregroundColor(.secondary)
                    Text("\(monthPct)%")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(percentageAmber)
                }
                HStack(spacing: 6) {
                    Text("\(state.monthDaysPassed ?? 0)d passed")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(daysPassedRed)
                    Text("·")
                        .foregroundColor(.secondary)
                    Text("\(state.monthDaysLeft ?? 0)d left")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(daysLeftGreen)
                }
            case .pet:
                let hunger = state.petHunger ?? 50
                let happiness = state.petHappiness ?? 50
                let energy = state.petEnergy ?? 50
                HStack(spacing: 6) {
                    PixelPetView(state: state, size: .lockScreen)
                    Text(state.petName ?? "Pet")
                        .font(.system(size: 14, weight: .semibold))
                }
                Text(getPetStatusText(hunger: hunger, happiness: happiness, energy: energy))
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.secondary)
            case .streak:
                Text("🔥 \(state.streakCount ?? 0)-day streak")
                    .font(.system(size: 14, weight: .semibold))
            case .event:
                Text("\(state.eventName ?? "Event") · \(state.eventDaysLeft ?? 0)d")
                    .font(.system(size: 14, weight: .semibold))
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, 12)
        .padding(.vertical, 6)
    }

    @ViewBuilder
    private func compactView(state: YearProgressContentState, mode: LiveActivityMode, leading: Bool) -> some View {
        switch mode {
        case .yearProgress:
            if leading {
                Text(yearString(state.year))
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(.primary)
            } else {
                Text("\(Int(state.percentage))%")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(percentageAmber)
            }
        case .countdown:
            if leading {
                Text("\(state.daysPassed)d passed")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(daysPassedRed)
            } else {
                Text("\(state.daysLeft)d left")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(daysLeftGreen)
            }
        case .dayProgress:
            let dayPct = state.dayProgressPercentage ?? 0
            let dayLeft = 100 - dayPct
            if leading {
                Text("\(Int(dayPct))%")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(daysPassedRed)
            } else {
                Text("\(Int(dayLeft))% left")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(daysLeftGreen)
            }
        case .monthProgress:
            let month = state.month ?? 1
            if leading {
                Text(monthName(month))
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(.primary)
            } else {
                Text("\(Int(state.monthPercentage ?? 0))%")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(percentageAmber)
            }
        case .pet:
            let hunger = state.petHunger ?? 50
            let happiness = state.petHappiness ?? 50
            let energy = state.petEnergy ?? 50
            let statusEmoji = getPetStatusEmoji(hunger: hunger, happiness: happiness, energy: energy)
            if leading {
                PixelPetView(state: state, size: .compact)
            } else {
                Text(statusEmoji)
                    .font(.system(size: 14))
            }
        case .streak:
            Text("🔥 \(state.streakCount ?? 0)")
                .font(.system(size: 13, weight: .semibold))
        case .event:
            if leading {
                Text(state.eventName ?? "")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(.primary)
            } else {
                Text("\(state.eventDaysLeft ?? 0)d")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(daysLeftGreen)
            }
        }
    }

    @ViewBuilder
    private func minimalView(state: YearProgressContentState, mode: LiveActivityMode) -> some View {
        switch mode {
        case .yearProgress:
            Text("\(Int(state.percentage))%")
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(percentageAmber)
        case .countdown:
            Text("\(state.daysLeft) days left")
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(daysLeftGreen)
        case .dayProgress:
            let dayPct = state.dayProgressPercentage ?? 0
            Text("\(Int(dayPct))%")
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(percentageAmber)
        case .monthProgress:
            Text("\(Int(state.monthPercentage ?? 0))%")
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(percentageAmber)
        case .pet:
            PixelPetView(state: state, size: .minimal)
        case .streak:
            Text("🔥\(state.streakCount ?? 0)")
                .font(.system(size: 13, weight: .semibold))
        case .event:
            Text("\(state.eventDaysLeft ?? 0)d")
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(daysLeftGreen)
        }
    }

    @ViewBuilder
    private func expandedLeading(state: YearProgressContentState, mode: LiveActivityMode) -> some View {
        switch mode {
        case .yearProgress:
            VStack(alignment: .leading, spacing: 4) {
                Text("Year")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(.secondary)
                Text(yearString(state.year))
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(.primary)
                Text("\(state.daysPassed)d passed")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(daysPassedRed)
            }
        case .countdown:
            VStack(alignment: .leading, spacing: 4) {
                Text("Days passed")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(.secondary)
                Text("\(yearString(state.year))")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(.secondary)
                Text("\(state.daysPassed)d")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(daysPassedRed)
            }
        case .dayProgress:
            let dayPct = state.dayProgressPercentage ?? 0
            VStack(alignment: .leading, spacing: 4) {
                Text("Today")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(.secondary)
                Text("\(Int(dayPct))% done")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(daysPassedRed)
            }
        case .monthProgress:
            let month = state.month ?? 1
            VStack(alignment: .leading, spacing: 4) {
                Text("Month")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(.secondary)
                Text(monthName(month))
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(.primary)
                Text("\(state.monthDaysPassed ?? 0)d passed")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(daysPassedRed)
            }
        case .pet:
            let petName = state.petName ?? "Pet"
            VStack(alignment: .leading, spacing: 4) {
                Text("Pet")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(.secondary)
                Text(petName)
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(.primary)
                if let lastFed = state.petLastFed {
                    Text("Fed \(formatRelativeDate(lastFed))")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(.secondary)
                } else {
                    Text("Never fed")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(.secondary)
                }
            }
        case .streak:
            Text("🔥")
                .font(.system(size: 14))
        case .event:
            Text(state.eventName ?? "")
                .font(.system(size: 12, weight: .medium))
                .lineLimit(1)
                .foregroundColor(.primary)
        }
    }

    @ViewBuilder
    private func expandedTrailing(state: YearProgressContentState, mode: LiveActivityMode) -> some View {
        switch mode {
            case .yearProgress:
                VStack(alignment: .trailing, spacing: 4) {
                    Text("Progress")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(.secondary)
                    Text("\(Int(state.percentage))%")
                        .font(.system(size: 15, weight: .bold))
                        .foregroundColor(percentageAmber)
                    Text("\(state.daysLeft)d left")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(daysLeftGreen)
                }
            case .countdown:
                VStack(alignment: .trailing, spacing: 4) {
                    Text("Days left")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(.secondary)
                    Text("\(state.daysLeft)d")
                        .font(.system(size: 15, weight: .bold))
                        .foregroundColor(daysLeftGreen)
                }
            case .dayProgress:
                let dayPct = state.dayProgressPercentage ?? 0
                let dayLeft = 100 - dayPct
                VStack(alignment: .trailing, spacing: 4) {
                    Text("Left today")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(.secondary)
                    Text("\(Int(dayLeft))%")
                        .font(.system(size: 15, weight: .bold))
                        .foregroundColor(daysLeftGreen)
                }
            case .monthProgress:
                VStack(alignment: .trailing, spacing: 4) {
                    Text("Progress")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(.secondary)
                    Text("\(Int(state.monthPercentage ?? 0))%")
                        .font(.system(size: 15, weight: .bold))
                        .foregroundColor(percentageAmber)
                    Text("\(state.monthDaysLeft ?? 0)d left")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(daysLeftGreen)
                }
            case .pet:
                let hunger = state.petHunger ?? 50
                let happiness = state.petHappiness ?? 50
                let energy = state.petEnergy ?? 50
                VStack(alignment: .trailing, spacing: 4) {
                    Text("Stats")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(.secondary)
                    Text("H:\(hunger) Hp:\(happiness) E:\(energy)")
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(.secondary)
                }
            case .streak:
                Text("\(state.streakCount ?? 0) days")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.primary)
            case .event:
                Text("\(state.eventDaysLeft ?? 0) days")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.primary)
        }
    }

    @ViewBuilder
    private func expandedCenter(state: YearProgressContentState, mode: LiveActivityMode) -> some View {
        switch mode {
            case .yearProgress:
                VStack(spacing: 2) {
                    Text("\(Int(state.percentage))%")
                        .font(.system(size: 22, weight: .bold))
                        .foregroundColor(percentageAmber)
                    Text("year")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(.secondary)
                }
            case .countdown:
                VStack(spacing: 2) {
                    Text("\(state.daysLeft)")
                        .font(.system(size: 22, weight: .bold))
                        .foregroundColor(daysLeftGreen)
                    Text("days left")
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(.secondary)
                }
            case .dayProgress:
                let dayPct = state.dayProgressPercentage ?? 0
                VStack(spacing: 2) {
                    Text("\(Int(dayPct))%")
                        .font(.system(size: 22, weight: .bold))
                        .foregroundColor(percentageAmber)
                    Text("day done")
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(.secondary)
                }
            case .monthProgress:
                let month = state.month ?? 1
                VStack(spacing: 2) {
                    Text("\(Int(state.monthPercentage ?? 0))%")
                        .font(.system(size: 22, weight: .bold))
                        .foregroundColor(percentageAmber)
                    Text(monthName(month))
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(.secondary)
                }
            case .pet:
                let hunger = state.petHunger ?? 50
                let happiness = state.petHappiness ?? 50
                let energy = state.petEnergy ?? 50
                VStack(spacing: 2) {
                    PixelPetView(state: state, size: .expanded)
                    Text(getPetStatusText(hunger: hunger, happiness: happiness, energy: energy))
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(.secondary)
                    Text("Tap to open · Feed/Play below")
                        .font(.system(size: 9, weight: .medium))
                        .foregroundColor(.secondary)
                }
            case .streak:
                Text("Streak")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.secondary)
            case .event:
                Text("\(state.eventDaysLeft ?? 0)d")
                    .font(.system(size: 22, weight: .bold))
                    .foregroundColor(daysLeftGreen)
        }
    }

    @ViewBuilder
    private func expandedBottom(state: YearProgressContentState, mode: LiveActivityMode) -> some View {
        switch mode {
            case .yearProgress:
                VStack(spacing: 8) {
                    GeometryReader { geometry in
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 3)
                                .fill(SwiftUI.Color(uiColor: .tertiarySystemFill))
                                .frame(height: 5)
                            RoundedRectangle(cornerRadius: 3)
                                .fill(percentageAmber)
                                .frame(width: max(0, geometry.size.width * (state.percentage / 100)), height: 5)
                        }
                    }
                    .frame(height: 5)
                    Text("Year progress")
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(.secondary)
                }
            case .countdown:
                VStack(spacing: 8) {
                    GeometryReader { geometry in
                        let leftFraction = state.totalDays > 0 ? Double(state.daysLeft) / Double(state.totalDays) : 0
                        ZStack(alignment: .trailing) {
                            RoundedRectangle(cornerRadius: 3)
                                .fill(SwiftUI.Color(uiColor: .tertiarySystemFill))
                                .frame(height: 5)
                            RoundedRectangle(cornerRadius: 3)
                                .fill(daysLeftGreen)
                                .frame(width: max(0, geometry.size.width * leftFraction), height: 5)
                                .frame(maxWidth: .infinity, alignment: .trailing)
                        }
                    }
                    .frame(height: 5)
                    HStack(spacing: 4) {
                        Text("\(state.daysPassed)d passed")
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(daysPassedRed)
                        Text("·")
                            .foregroundColor(.secondary)
                        Text("\(state.daysLeft)d left in \(yearString(state.year))")
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(daysLeftGreen)
                    }
                }
            case .dayProgress:
                let dayPct = state.dayProgressPercentage ?? 0
                VStack(spacing: 8) {
                    GeometryReader { geometry in
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 3)
                                .fill(SwiftUI.Color(uiColor: .tertiarySystemFill))
                                .frame(height: 5)
                            RoundedRectangle(cornerRadius: 3)
                                .fill(percentageAmber)
                                .frame(width: max(0, geometry.size.width * (dayPct / 100)), height: 5)
                        }
                    }
                    .frame(height: 5)
                    Text("Day progress")
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(.secondary)
                }
            case .monthProgress:
                let monthPct = state.monthPercentage ?? 0
                VStack(spacing: 8) {
                    GeometryReader { geometry in
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 3)
                                .fill(SwiftUI.Color(uiColor: .tertiarySystemFill))
                                .frame(height: 5)
                            RoundedRectangle(cornerRadius: 3)
                                .fill(percentageAmber)
                                .frame(width: max(0, geometry.size.width * (monthPct / 100)), height: 5)
                        }
                    }
                    .frame(height: 5)
                    HStack(spacing: 4) {
                        Text("\(state.monthDaysPassed ?? 0)d passed")
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(daysPassedRed)
                        Text("·")
                            .foregroundColor(.secondary)
                        Text("\(state.monthDaysLeft ?? 0)d left")
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(daysLeftGreen)
                    }
                }
            case .pet:
                let hunger = state.petHunger ?? 50
                let happiness = state.petHappiness ?? 50
                let energy = state.petEnergy ?? 50
                VStack(spacing: 8) {
                    HStack(spacing: 8) {
                        VStack(spacing: 2) {
                            Text("Hunger")
                                .font(.system(size: 9, weight: .medium))
                                .foregroundColor(.secondary)
                            GeometryReader { geometry in
                                ZStack(alignment: .leading) {
                                    RoundedRectangle(cornerRadius: 2)
                                        .fill(SwiftUI.Color(uiColor: .tertiarySystemFill))
                                        .frame(height: 4)
                                    RoundedRectangle(cornerRadius: 2)
                                        .fill(hunger < 30 ? daysPassedRed : daysLeftGreen)
                                        .frame(width: max(0, geometry.size.width * (Double(hunger) / 100)), height: 4)
                                }
                            }
                            .frame(height: 4)
                        }
                        VStack(spacing: 2) {
                            Text("Happy")
                                .font(.system(size: 9, weight: .medium))
                                .foregroundColor(.secondary)
                            GeometryReader { geometry in
                                ZStack(alignment: .leading) {
                                    RoundedRectangle(cornerRadius: 2)
                                        .fill(SwiftUI.Color(uiColor: .tertiarySystemFill))
                                        .frame(height: 4)
                                    RoundedRectangle(cornerRadius: 2)
                                        .fill(happiness < 30 ? daysPassedRed : daysLeftGreen)
                                        .frame(width: max(0, geometry.size.width * (Double(happiness) / 100)), height: 4)
                                }
                            }
                            .frame(height: 4)
                        }
                        VStack(spacing: 2) {
                            Text("Energy")
                                .font(.system(size: 9, weight: .medium))
                                .foregroundColor(.secondary)
                            GeometryReader { geometry in
                                ZStack(alignment: .leading) {
                                    RoundedRectangle(cornerRadius: 2)
                                        .fill(SwiftUI.Color(uiColor: .tertiarySystemFill))
                                        .frame(height: 4)
                                    RoundedRectangle(cornerRadius: 2)
                                        .fill(energy < 30 ? daysPassedRed : percentageAmber)
                                        .frame(width: max(0, geometry.size.width * (Double(energy) / 100)), height: 4)
                                }
                            }
                            .frame(height: 4)
                        }
                    }
                    HStack(spacing: 12) {
                        Link(destination: URL(string: "wallpe://pet?action=feed")!) {
                            Label("Feed", systemImage: "fork.knife")
                                .font(.system(size: 10, weight: .medium))
                        }
                        Link(destination: URL(string: "wallpe://pet?action=play")!) {
                            Label("Play", systemImage: "gamecontroller")
                                .font(.system(size: 10, weight: .medium))
                        }
                        Link(destination: URL(string: "wallpe://pet?action=rest")!) {
                            Label("Rest", systemImage: "bed.double")
                                .font(.system(size: 10, weight: .medium))
                        }
                        Link(destination: URL(string: "wallpe://pet")!) {
                            Label("Open", systemImage: "arrow.right.circle")
                                .font(.system(size: 10, weight: .medium))
                        }
                    }
                }
            case .streak:
                Text("Consistency streak")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(.secondary)
            case .event:
                Text(state.eventName ?? "Countdown")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(.secondary)
        }
    }
}

// MARK: - Widget Definition

struct YearProgressWidget: Widget {
    let kind: String = "YearProgressWidget"
    
    private var supportedWidgetFamilies: [WidgetFamily] {
        var families: [WidgetFamily] = [.systemSmall, .systemMedium, .systemLarge]
        if #available(iOS 16.0, *) {
            families.append(contentsOf: [.accessoryRectangular, .accessoryCircular, .accessoryInline])
        }
        return families
    }

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: YearProgressProvider()) { entry in
            YearProgressWidgetView(entry: entry)
        }
        .configurationDisplayName("Year Progress")
        .description("Track the current year's progress: days passed, days left, and percentage.")
        .supportedFamilies(supportedWidgetFamilies)
    }
}

// MARK: - Widget Extension Entry Point

@main
struct YearProgressWidgetBundle: WidgetBundle {
    @WidgetBundleBuilder
    var body: some Widget {
        YearProgressWidget()
        YearProgressLiveActivityWidget()
    }
}

// MARK: - Previews

struct YearProgressWidget_Previews: PreviewProvider {
    static var previews: some View {
        YearProgressWidgetView(entry: YearProgressEntry(
            date: Date(),
            daysPassed: 30,
            daysLeft: 335,
            totalDays: 365,
            percentage: 8.2,
            dayProgressPercentage: 42.5
        ))
    }
}
