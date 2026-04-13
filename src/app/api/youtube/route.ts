import { NextRequest, NextResponse } from "next/server";

interface YouTubeSnippet {
  title: string;
  channelTitle: string;
  thumbnails: {
    medium: { url: string; width: number; height: number };
  };
  publishedAt: string;
}

interface YouTubeSearchItem {
  id: { videoId?: string };
  snippet: YouTubeSnippet;
}

interface YouTubeAPIResponse {
  items?: YouTubeSearchItem[];
  error?: { message: string; code: number };
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  if (!query || query.trim().length === 0) {
    return NextResponse.json(
      { error: "검색어를 입력해주세요." },
      { status: 400 }
    );
  }

  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey || apiKey === "your_youtube_api_key_here") {
    return NextResponse.json(
      {
        error: "YOUTUBE_API_KEY가 설정되지 않았습니다.",
        hint: ".env.local 파일에 YOUTUBE_API_KEY를 설정해주세요.",
        missingKey: true,
      },
      { status: 503 }
    );
  }

  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("q", query);
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", "6");
    url.searchParams.set("key", apiKey);

    const res = await fetch(url.toString(), { next: { revalidate: 60 } });
    const data: YouTubeAPIResponse = await res.json();

    if (!res.ok) {
      const msg = data.error?.message ?? "YouTube API 요청에 실패했습니다.";
      return NextResponse.json({ error: msg }, { status: res.status });
    }

    const videos = (data.items ?? [])
      .filter((item) => item.id.videoId)
      .map((item) => ({
        videoId: item.id.videoId!,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.medium.url,
        publishedAt: item.snippet.publishedAt,
      }));

    return NextResponse.json({ videos });
  } catch {
    return NextResponse.json(
      { error: "YouTube API 서버에 연결할 수 없습니다." },
      { status: 502 }
    );
  }
}
