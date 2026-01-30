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

// MARK: - Colors (match Android) — use SwiftUI.Color to avoid overload ambiguity

private let accentColor: SwiftUI.Color = SwiftUI.Color(red: 187/255, green: 134/255, blue: 252/255)  // #BB86FC
private let pendingDotColor: SwiftUI.Color = SwiftUI.Color(red: 51/255, green: 51/255, blue: 51/255)  // #333333
private let subtitleGray: SwiftUI.Color = SwiftUI.Color(red: 128/255, green: 128/255, blue: 128/255) // #808080

// MARK: - Widget View

struct YearProgressWidgetView: View {
    var entry: YearProgressEntry
    @Environment(\.widgetFamily) var family

    private let cols = 25
    private let rows = 15
    private let totalDots = 365

    var body: some View {
        VStack(spacing: 0) {
            // Dot grid (365 dots: 25 x 15)
            dotGrid
                .padding(.top, 4)
                .padding(.bottom, 6)

            // Days row: "30d passed" and "335d Left"
            HStack(spacing: 16) {
                Text("\(entry.daysPassed)d passed")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(.white)
                Text("\(entry.daysLeft)d Left")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(accentColor)
            }
            .padding(.top, 4)

            // Percentage
            Text(String(format: "%.1f%%", entry.percentage))
                .font(.system(size: 26, weight: .bold))
                .foregroundColor(accentColor)
                .padding(.top, 6)

            // Subtitle
            Text("of year")
                .font(.system(size: 13))
                .foregroundColor(subtitleGray)
                .padding(.top, 2)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(12)
        .background(SwiftUI.Color.black)
        .widgetURL(URL(string: "wallpe://year-progress"))
    }

    private func color(forDay day: Int) -> SwiftUI.Color {
        if day <= entry.daysPassed { return accentColor }
        return pendingDotColor
    }

    private var dotGrid: some View {
        let columns = Array(repeating: GridItem(.flexible(), spacing: 2), count: cols)
        return LazyVGrid(columns: columns, spacing: 2) {
            ForEach(0..<totalDots, id: \.self) { index in
                let day = index + 1
                Circle()
                    .fill(color(forDay: day))
                    .aspectRatio(1, contentMode: .fit)
            }
        }
        .frame(minHeight: 120)
    }
}

// MARK: - Widget Definition

struct YearProgressWidget: Widget {
    let kind: String = "YearProgressWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: YearProgressProvider()) { entry in
            YearProgressWidgetView(entry: entry)
        }
        .configurationDisplayName("Year Progress")
        .description("Track the current year's progress: days passed, days left, and percentage.")
        .supportedFamilies([.systemSmall, .systemMedium])
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
