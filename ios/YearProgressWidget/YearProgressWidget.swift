import WidgetKit
import SwiftUI

// MARK: - Timeline Entry

struct YearProgressEntry: TimelineEntry {
    let date: Date
    let daysPassed: Int
    let daysLeft: Int
    let totalDays: Int
    let percentage: Double
}

// MARK: - Timeline Provider

struct YearProgressProvider: TimelineProvider {
    func placeholder(in context: Context) -> YearProgressEntry {
        YearProgressEntry(
            date: Date(),
            daysPassed: 30,
            daysLeft: 335,
            totalDays: 365,
            percentage: 8.2
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (YearProgressEntry) -> Void) {
        completion(makeEntry(for: Date()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<YearProgressEntry>) -> Void) {
        let now = Date()
        let entry = makeEntry(for: now)
        let calendar = Calendar.current
        let startOfTomorrow = calendar.startOfDay(for: calendar.date(byAdding: .day, value: 1, to: now)!)
        let timeline = Timeline(entries: [entry], policy: .after(startOfTomorrow))
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
        return YearProgressEntry(
            date: date,
            daysPassed: daysPassed,
            daysLeft: daysLeft,
            totalDays: totalDays,
            percentage: percentage
        )
    }
}

// MARK: - Colors (match Android) — explicit SwiftUI.Color to avoid overload ambiguity

private let widgetPurple: SwiftUI.Color = SwiftUI.Color(red: 187/255, green: 134/255, blue: 252/255)  // #BB86FC
private let widgetDotMuted: SwiftUI.Color = SwiftUI.Color(red: 51/255, green: 51/255, blue: 51/255)    // #333333
private let widgetSubtitleGray: SwiftUI.Color = SwiftUI.Color(red: 128/255, green: 128/255, blue: 128/255) // #808080

// MARK: - Widget View

struct YearProgressWidgetView: View {
    var entry: YearProgressEntry
    @Environment(\.widgetFamily) var family

    private let cols = 6  // 6 columns for 12 months (2 rows)
    private let totalDots = 12  // 12 months instead of 365 days

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
            // Dot grid (12 months)
            dotGrid
                .padding(.top, isLarge ? 16 : 8)
                .padding(.bottom, isLarge ? 12 : 8)
            
            // Progress bar
            progressBar
                .padding(.bottom, isLarge ? 16 : 10)

            // Days row: "30d passed" and "335d Left"
            HStack(spacing: isLarge ? 24 : 12) {
                Text("\(entry.daysPassed)d passed")
                    .font(.system(size: isLarge ? 24 : 16, weight: .bold))
                    .foregroundColor(.white)
                Text("\(entry.daysLeft)d Left")
                    .font(.system(size: isLarge ? 24 : 16, weight: .bold))
                    .foregroundColor(widgetPurple)
            }
            .padding(.top, isLarge ? 16 : 8)

            // Percentage
            Text(String(format: "%.1f%%", entry.percentage))
                .font(.system(size: isLarge ? 32 : 22, weight: .bold))
                .foregroundColor(widgetPurple)
                .padding(.top, isLarge ? 16 : 10)

            // Subtitle
            Text("of year")
                .font(.system(size: isLarge ? 16 : 12))
                .foregroundColor(widgetSubtitleGray)
                .padding(.top, isLarge ? 8 : 4)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(isLarge ? 24 : 12)
        .widgetBackground(SwiftUI.Color.black)
        .widgetURL(URL(string: "wallpe://year-progress"))
    }
    
    // MARK: - Lock Screen Views
    
    private var lockScreenView: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text("\(entry.daysPassed)d passed")
                    .font(.system(size: 14, weight: .semibold))
                Text("•")
                    .foregroundColor(.secondary)
                Text("\(entry.daysLeft)d left")
                    .font(.system(size: 14, weight: .semibold))
            }
            Text(String(format: "%.1f%% of year", entry.percentage))
                .font(.system(size: 12))
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
    
    private var lockScreenCircularView: some View {
        VStack(spacing: 2) {
            Text(String(format: "%.0f%%", entry.percentage))
                .font(.system(size: 20, weight: .bold))
            Text("\(entry.daysPassed)")
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(.secondary)
        }
    }
    
    private var lockScreenInlineView: some View {
        Text(String(format: "%.1f%% of year • %d days passed", entry.percentage, entry.daysPassed))
            .font(.system(size: 14))
    }
    
    private var isLarge: Bool {
        family == .systemLarge
    }

    private func dotColor(forMonth month: Int) -> SwiftUI.Color {
        let calendar = Calendar.current
        let currentMonth = calendar.component(.month, from: entry.date)
        // Highlight past months and current month
        if month <= currentMonth { return widgetPurple }
        return widgetDotMuted
    }

    private var dotGrid: some View {
        let dotSize: CGFloat = isLarge ? 12 : 10
        let spacing: CGFloat = isLarge ? 12 : 8
        let columns = Array(repeating: GridItem(.flexible(), spacing: spacing), count: cols)
        
        return LazyVGrid(columns: columns, spacing: spacing) {
            ForEach(1...12, id: \.self) { month in
                let fillColor: SwiftUI.Color = dotColor(forMonth: month)
                Circle()
                    .fill(fillColor)
                    .frame(width: dotSize, height: dotSize)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.horizontal, isLarge ? 8 : 4)
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
                
                // Progress fill
                RoundedRectangle(cornerRadius: barHeight / 2)
                    .fill(widgetPurple)
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
            percentage: 8.2
        ))
    }
}
