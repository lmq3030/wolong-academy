#!/usr/bin/env python3
"""Generate images using Google Gemini API (compatible with google-genai >= 1.x)."""
import os
import sys
import argparse
import uuid
from dotenv import load_dotenv
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO

# Load environment variables
load_dotenv(os.path.expanduser("~") + "/.nanobanana.env")

api_key = os.getenv("GEMINI_API_KEY") or ""
if not api_key:
    raise ValueError("Missing GEMINI_API_KEY environment variable.")

client = genai.Client(api_key=api_key)

ASPECT_RATIO_MAP = {
    "1024x1024": "1:1",
    "832x1248": "2:3",
    "1248x832": "3:2",
    "864x1184": "3:4",
    "1184x864": "4:3",
    "896x1152": "4:5",
    "1152x896": "5:4",
    "768x1344": "9:16",
    "1344x768": "16:9",
    "1536x672": "21:9",
}


def main():
    parser = argparse.ArgumentParser(description="Generate images using Google Gemini API")
    parser.add_argument("--prompt", type=str, required=True)
    parser.add_argument("--output", type=str, default=f"output-{uuid.uuid4()}.png")
    parser.add_argument("--size", type=str, default="1024x1024", choices=list(ASPECT_RATIO_MAP.keys()))
    parser.add_argument("--model", type=str, default="gemini-2.0-flash-exp")

    args = parser.parse_args()
    aspect_ratio = ASPECT_RATIO_MAP.get(args.size, "1:1")

    # Include aspect ratio hint in the prompt for generate_content
    prompt_with_ratio = f"{args.prompt} (aspect ratio: {aspect_ratio})"
    print(f"Generating image ({args.size}, {aspect_ratio}) with model: {args.model}")
    print(f"Prompt: {args.prompt[:100]}...")

    config_kwargs = {
        "response_modalities": ["TEXT", "IMAGE"],
    }

    # Try with thinking config first, fall back without if unsupported
    try:
        response = client.models.generate_content(
            model=args.model,
            contents=[prompt_with_ratio],
            config=types.GenerateContentConfig(**config_kwargs),
        )
    except Exception as e:
        print(f"First attempt failed: {e}")
        print("Retrying without extra config...")
        response = client.models.generate_content(
            model=args.model,
            contents=[prompt_with_ratio],
            config=types.GenerateContentConfig(
                response_modalities=["TEXT", "IMAGE"],
            ),
        )

    if (
        response.candidates is None
        or len(response.candidates) == 0
        or response.candidates[0].content is None
        or response.candidates[0].content.parts is None
    ):
        print("ERROR: No data received from the API.")
        sys.exit(1)

    image_saved = False
    for part in response.candidates[0].content.parts:
        if part.text is not None:
            print(f"{part.text}", end="")
        elif part.inline_data is not None and part.inline_data.data is not None:
            image = Image.open(BytesIO(part.inline_data.data))
            # Ensure output directory exists
            os.makedirs(os.path.dirname(args.output) if os.path.dirname(args.output) else ".", exist_ok=True)
            image.save(args.output)
            image_saved = True
            print(f"\nImage saved to: {args.output}")

    if not image_saved:
        print("ERROR: No image data in API response.")
        sys.exit(1)


if __name__ == "__main__":
    main()
