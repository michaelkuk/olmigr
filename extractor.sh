#!/usr/bin/env bash
# Usage: ./extract_chunks.sh <manifest-file> <base-image-name> [output-directory]
#
# Example:
#   ./extract_chunks.sh manifest.txt myrepo/chunk_image ./extracted
#
# The manifest file should contain one filename per line.
# Each image is expected to be tagged as <base-image-name>:<filename>
# and to contain the file at /data/chunk.

# Check that at least 2 arguments are provided.
if [ "$#" -lt 2 ]; then
    echo "Usage: $0 <manifest-file> <base-image-name> [output-directory]"
    exit 1
fi

MANIFEST="$1"
BASE_IMAGE="$2"
OUTPUT_DIR="${3:-.}"  # Defaults to current directory if not provided.

# Ensure the manifest file exists.
if [ ! -f "$MANIFEST" ]; then
    echo "Error: Manifest file '$MANIFEST' does not exist."
    exit 1
fi

# Create output directory if it does not exist.
mkdir -p "$OUTPUT_DIR"

# Process each filename in the manifest.
while IFS= read -r filename || [ -n "$filename" ]; do
    # Trim any extra whitespace.
    filename=$(echo "$filename" | xargs)
    
    # Skip empty lines.
    if [ -z "$filename" ]; then
        continue
    fi

    IMAGE_TAG="${BASE_IMAGE}:${filename}"
    echo "Pulling Docker image '${IMAGE_TAG}'..."
    docker pull "$IMAGE_TAG" || { echo "Failed to pull image '${IMAGE_TAG}'"; continue; }

    echo "Creating container from image '${IMAGE_TAG}'..."
    container_id=$(docker create "$IMAGE_TAG")
    if [ -z "$container_id" ]; then
        echo "Error: Failed to create container from image '${IMAGE_TAG}'."
        continue
    fi

    TARGET_FILE="${OUTPUT_DIR}/${filename}"
    echo "Extracting '/data/chunk' from container to '${TARGET_FILE}'..."
    docker cp "${container_id}:/data/chunk" "$TARGET_FILE" || \
        echo "Error: Failed to copy /data/chunk from container ${container_id}"

    echo "Cleaning up container ${container_id}..."
    docker rm "$container_id" > /dev/null

    echo "Done processing '${filename}'."
    echo "------------------------------------"
done < "$MANIFEST"
