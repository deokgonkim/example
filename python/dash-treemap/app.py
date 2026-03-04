# treemap_drillthrough.py
# pip install dash pandas plotly

from __future__ import annotations

import pandas as pd
import plotly.express as px
from dash import Dash, dcc, html, Input, Output
from dash.dash_table import DataTable

# ---- sample data (dgkim님 예시를 느낌대로 확장) ----
rows = [
    # topic, keyword, title, url, desc, weight
    ("linux", "dhcp", "isc-dhcp-server", "https://kb.isc.org/docs/isc-dhcp-44-manual-pages-dhcpd", "ISC DHCP Server docs", 40),
    ("linux", "network", "bonding", "https://www.kernel.org/doc/Documentation/networking/bonding.txt", "Linux bonding driver", 30),
    ("linux", "limits", "max open files", "https://man7.org/linux/man-pages/man5/limits.conf.5.html", "ulimit / limits.conf", 20),
    ("software", "java", "jackrabbit", "https://jackrabbit.apache.org/", "Apache Jackrabbit", 25),
    ("software", "im", "pidgin", "https://pidgin.im/", "Pidgin IM", 15),
    ("linux", "dhcp", "kea", "https://kea.isc.org/", "ISC Kea DHCP", 35),
    ("software", "java", "lucene", "https://lucene.apache.org/", "Apache Lucene", 18),
]
df = pd.DataFrame(rows, columns=["topic", "keyword", "title", "url", "desc", "weight"])

def filter_data(data: pd.DataFrame, query: str | None) -> pd.DataFrame:
    if not query:
        return data

    q = query.strip().lower()
    if not q:
        return data

    mask = (
        data["topic"].str.lower().str.contains(q, na=False)
        | data["keyword"].str.lower().str.contains(q, na=False)
        | data["title"].str.lower().str.contains(q, na=False)
        | data["desc"].str.lower().str.contains(q, na=False)
        | data["url"].str.lower().str.contains(q, na=False)
    )
    return data[mask]

# ---- helper: main treemap ----
def make_main_treemap(data: pd.DataFrame):
    if len(data) == 0:
        fig = px.treemap(pd.DataFrame([{"label": "(no data)", "weight": 1}]), path=["label"], values="weight")
        fig.update_layout(margin=dict(t=10, l=10, r=10, b=10))
        return fig

    fig = px.treemap(
        data,
        path=["topic", "keyword", "title"],
        values="weight",
        hover_data={"url": True, "desc": True, "weight": True},
    )
    fig.update_layout(margin=dict(t=10, l=10, r=10, b=10))
    return fig

# ---- helper: detail treemap (drillthrough) ----
def make_detail_treemap(data: pd.DataFrame, selected_topic=None, selected_keyword=None):
    # 기본: topic 단위 drillthrough
    d = data.copy()

    title = "Detail (click a tile)"
    if selected_keyword:
        d = d[(d["keyword"] == selected_keyword)]
        title = f"Detail: keyword = {selected_keyword}"
        path = ["title"]  # keyword가 이미 고정되어 있으니 title만
    elif selected_topic:
        d = d[(d["topic"] == selected_topic)]
        title = f"Detail: topic = {selected_topic}"
        path = ["keyword", "title"]
    else:
        # 아무 것도 선택 안 했을 때는 topic 기준으로 보여주기
        path = ["topic", "keyword"]

    if len(d) == 0:
        # 빈 figure
        fig = px.treemap(pd.DataFrame([{"label": "(no data)", "weight": 1}]),
                         path=["label"], values="weight")
        fig.update_layout(title=title, margin=dict(t=40, l=10, r=10, b=10))
        return fig

    fig = px.treemap(d, path=path, values="weight", hover_data={"url": True, "desc": True})
    fig.update_layout(title=title, margin=dict(t=40, l=10, r=10, b=10))
    return fig

def parse_click(data: pd.DataFrame, clickData):
    """
    Plotly treemap clickData에서 label/parent 등을 뽑아
    topic/keyword를 최대한 추정.
    """
    if not clickData or "points" not in clickData or not clickData["points"]:
        return None, None

    p = clickData["points"][0]
    label = p.get("label")
    parent = p.get("parent")  # parent label
    # path는 p.get("id") 등에 들어오기도 하지만 버전/설정마다 달라서 보수적으로 처리

    # label이 topic/keyword/title 중 뭘지 모름.
    # 간단 규칙:
    # - label이 topic 컬럼에 있으면 topic
    # - label이 keyword 컬럼에 있으면 keyword
    # - label이 title 컬럼에 있으면 title (그때 parent를 keyword로 보고 keyword 추정)
    topics = set(data["topic"])
    keywords = set(data["keyword"])
    titles = set(data["title"])

    topic = label if label in topics else None
    keyword = label if label in keywords else None

    if label in titles:
        # title이면 parent가 keyword일 가능성이 높음
        if parent in keywords:
            keyword = parent
        # parent가 topic일 수도 있으니 topic도 보조로 추정
        if parent in topics:
            topic = parent

    return topic, keyword

# ---- Dash app ----
app = Dash(__name__)

app.layout = html.Div(
    style={"display": "grid", "gridTemplateColumns": "1.2fr 1fr", "gap": "12px", "padding": "12px"},
    children=[
        html.Div(
            children=[
                html.H3("Main Treemap (overview)"),
                dcc.Input(
                    id="search-input",
                    type="text",
                    placeholder="Search topic / keyword / title / desc / url",
                    debounce=True,
                    style={"width": "100%", "marginBottom": "8px", "padding": "8px"},
                ),
                dcc.Graph(
                    id="main-treemap",
                    figure=make_main_treemap(df),
                    style={"height": "82vh"},
                    clear_on_unhover=True,
                ),
                html.Div(id="selection", style={"fontFamily": "monospace", "marginTop": "8px"}),
            ],
        ),
        html.Div(
            style={"display": "grid", "gridTemplateRows": "1fr 1fr", "gap": "12px"},
            children=[
                html.Div(
                    style={"border": "1px solid #ddd", "borderRadius": "10px", "padding": "8px"},
                    children=[
                        dcc.Graph(id="detail-treemap", figure=make_detail_treemap(df), style={"height": "38vh"}),
                    ],
                ),
                html.Div(
                    style={"border": "1px solid #ddd", "borderRadius": "10px", "padding": "8px", "overflow": "auto"},
                    children=[
                        html.H4("Links / Notes"),
                        DataTable(
                            id="detail-table",
                            columns=[
                                {"name": "topic", "id": "topic"},
                                {"name": "keyword", "id": "keyword"},
                                {"name": "title", "id": "title"},
                                {"name": "url", "id": "url", "presentation": "markdown"},
                                {"name": "desc", "id": "desc"},
                                {"name": "weight", "id": "weight"},
                            ],
                            data=[],
                            style_cell={"textAlign": "left", "whiteSpace": "normal", "height": "auto"},
                            style_table={"maxHeight": "32vh", "overflowY": "auto"},
                            markdown_options={"link_target": "_blank"},
                        ),
                        html.Div(
                            "Tip: url 컬럼은 클릭하면 새 탭으로 열립니다.",
                            style={"marginTop": "8px", "opacity": 0.7},
                        ),
                    ],
                ),
            ],
        ),
    ],
)

@app.callback(
    Output("main-treemap", "figure"),
    Input("search-input", "value"),
)
def update_main_treemap(search_query):
    filtered = filter_data(df, search_query)
    return make_main_treemap(filtered)

@app.callback(
    Output("detail-treemap", "figure"),
    Output("detail-table", "data"),
    Output("selection", "children"),
    Input("main-treemap", "clickData"),
    Input("search-input", "value"),
)
def drillthrough(clickData, search_query):
    filtered_df = filter_data(df, search_query)
    topic, keyword = parse_click(filtered_df, clickData)

    if keyword:
        filtered = filtered_df[filtered_df["keyword"] == keyword].sort_values("weight", ascending=False)
        fig = make_detail_treemap(filtered_df, selected_keyword=keyword)
        sel = f"selected keyword: {keyword}"
    elif topic:
        filtered = filtered_df[filtered_df["topic"] == topic].sort_values("weight", ascending=False)
        fig = make_detail_treemap(filtered_df, selected_topic=topic)
        sel = f"selected topic: {topic}"
    else:
        filtered = filtered_df.sort_values(["topic", "keyword", "weight"], ascending=[True, True, False]).head(50)
        fig = make_detail_treemap(filtered_df)
        sel = "selected: (none)"

    if search_query and search_query.strip():
        sel = f"{sel} | search: {search_query.strip()}"

    # DataTable에서 url을 markdown 링크로 렌더링
    data = filtered.copy()
    data["url"] = data["url"].map(lambda u: f"[open]({u})")
    return fig, data.to_dict("records"), sel

if __name__ == "__main__":
    app.run(debug=True)
