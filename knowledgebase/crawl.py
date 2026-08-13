import asyncio
from pathlib import Path
from crawl4ai import AsyncWebCrawler

async def main():
    output_dir = Path("knowledge_base/python")
    output_dir.mkdir(parents=True, exist_ok=True)

    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun(
            url="https://docs.python.org/3/"
        )

        with open(output_dir / "index.md", "w", encoding="utf-8") as f:
            f.write(result.markdown)

        print("Saved successfully!")

if __name__ == "__main__":
    asyncio.run(main())