import "@typespec/http";

using Http;
@service(#{ title: "Widget Service" })
@server("http://localhost:4010", "Mock Server")
namespace DemoService;

@example(#{id: "blue-widget", weight: 100, color: "blue"}, #{ title: "This is a blue widget" })
@example(#{id: "red-widget", weight: 100, color: "red"}, #{ title: "This is a red widget", description: "This is a red widget" })
model Widget {
  id: string;
  weight: int32;
  color: "red" | "blue";
}

model WidgetList {
  items: Widget[];
}

@error
model Error {
  code: int32;
  message: string;
}

model AnalyzeResult {
  id: string;
  analysis: string;
}

@route("/widgets")
@tag("Widgets")
interface Widgets {
  /** List widgets */
  @get list(): WidgetList | Error;
  /** Read widgets */
  @get read(@path id: string): Widget | Error;
  /** Create a widget */
  @post create(@body body: Widget): Widget | Error;
  /** Update a widget */
  @patch update(@path id: string, @body body: MergePatchUpdate<Widget>): Widget | Error;
  /** Delete a widget */
  @delete delete(@path id: string): void | Error;

  /** Analyze a widget */
  @route("{id}/analyze") @post analyze(@path id: string): AnalyzeResult | Error;
}
