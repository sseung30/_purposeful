import WidgetKit
import SwiftUI

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), tasks: sampleTasks)
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date(), tasks: sampleTasks)
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        var entries: [SimpleEntry] = []

        // Generate a timeline consisting of five entries an hour apart, starting from the current date.
        let currentDate = Date()
        for hourOffset in 0 ..< 5 {
            let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
            let entry = SimpleEntry(date: entryDate, tasks: loadTodayTasks())
            entries.append(entry)
        }

        let timeline = Timeline(entries: entries, policy: .atEnd)
        completion(timeline)
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let tasks: [TaskData]
}

struct TaskData {
    let id: String
    let text: String
    let completed: Bool
}

let sampleTasks = [
    TaskData(id: "1", text: "운동하기", completed: false),
    TaskData(id: "2", text: "책 읽기", completed: true),
    TaskData(id: "3", text: "프로젝트 완료", completed: false)
]

struct PurposefulWidgetEntryView : View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(tasks: entry.tasks)
        case .systemMedium:
            MediumWidgetView(tasks: entry.tasks)
        case .systemLarge:
            LargeWidgetView(tasks: entry.tasks)
        default:
            SmallWidgetView(tasks: entry.tasks)
        }
    }
}

struct SmallWidgetView: View {
    let tasks: [TaskData]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Image(systemName: "target")
                    .foregroundColor(.blue)
                    .font(.system(size: 16, weight: .semibold))
                Text("오늘")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.primary)
                Spacer()
            }
            
            let incompleteTasks = tasks.filter { !$0.completed }
            let completedCount = tasks.count - incompleteTasks.count
            
            Text("\(completedCount)/\(tasks.count) 완료")
                .font(.system(size: 12))
                .foregroundColor(.secondary)
            
            ForEach(incompleteTasks.prefix(3), id: \.id) { task in
                HStack(spacing: 6) {
                    Circle()
                        .stroke(Color.gray, lineWidth: 1.5)
                        .frame(width: 12, height: 12)
                    Text(task.text)
                        .font(.system(size: 11))
                        .lineLimit(1)
                        .foregroundColor(.primary)
                    Spacer()
                }
            }
            
            if incompleteTasks.count > 3 {
                Text("+\(incompleteTasks.count - 3) more")
                    .font(.system(size: 10))
                    .foregroundColor(.secondary)
            }
            
            Spacer()
        }
        .padding(12)
        .background(Color(.systemBackground))
    }
}

struct MediumWidgetView: View {
    let tasks: [TaskData]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: "target")
                    .foregroundColor(.blue)
                    .font(.system(size: 18, weight: .semibold))
                Text("오늘의 목표")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(.primary)
                Spacer()
                let completedCount = tasks.filter { $0.completed }.count
                Text("\(completedCount)/\(tasks.count)")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.secondary)
            }
            
            ForEach(tasks.prefix(5), id: \.id) { task in
                HStack(spacing: 8) {
                    if task.completed {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.blue)
                            .font(.system(size: 14))
                    } else {
                        Circle()
                            .stroke(Color.gray, lineWidth: 1.5)
                            .frame(width: 14, height: 14)
                    }
                    Text(task.text)
                        .font(.system(size: 13))
                        .strikethrough(task.completed)
                        .foregroundColor(task.completed ? .secondary : .primary)
                        .lineLimit(1)
                    Spacer()
                }
            }
            
            if tasks.count > 5 {
                Text("+\(tasks.count - 5) more tasks")
                    .font(.system(size: 11))
                    .foregroundColor(.secondary)
            }
            
            Spacer()
        }
        .padding(16)
        .background(Color(.systemBackground))
    }
}

struct LargeWidgetView: View {
    let tasks: [TaskData]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "target")
                    .foregroundColor(.blue)
                    .font(.system(size: 20, weight: .semibold))
                Text("오늘의 목표")
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundColor(.primary)
                Spacer()
                let completedCount = tasks.filter { $0.completed }.count
                Text("\(completedCount)/\(tasks.count) 완료")
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.secondary)
            }
            
            // Progress bar
            let progress = tasks.isEmpty ? 0.0 : Double(tasks.filter { $0.completed }.count) / Double(tasks.count)
            ProgressView(value: progress)
                .progressViewStyle(LinearProgressViewStyle(tint: .blue))
                .scaleEffect(x: 1, y: 2, anchor: .center)
            
            ForEach(tasks, id: \.id) { task in
                HStack(spacing: 10) {
                    if task.completed {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.blue)
                            .font(.system(size: 16))
                    } else {
                        Circle()
                            .stroke(Color.gray, lineWidth: 2)
                            .frame(width: 16, height: 16)
                    }
                    Text(task.text)
                        .font(.system(size: 14))
                        .strikethrough(task.completed)
                        .foregroundColor(task.completed ? .secondary : .primary)
                        .lineLimit(2)
                    Spacer()
                }
            }
            
            Spacer()
        }
        .padding(20)
        .background(Color(.systemBackground))
    }
}

// Load tasks from shared storage
func loadTodayTasks() -> [TaskData] {
    // This would connect to your shared data storage
    // For now, return sample data
    return sampleTasks
}

@main
struct PurposefulWidget: Widget {
    let kind: String = "PurposefulWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            PurposefulWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Purposeful Goals")
        .description("Track your daily goals right from your home screen.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}