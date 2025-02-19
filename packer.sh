#!/usr/bin/env bash

set -e

# Check that two arguments are provided.
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <directory> <image-name>"
    exit 1
fi

FILES_DIR="$1"
IMAGE_NAME="$2"

if [ ! -d "$FILES_DIR" ]; then
    echo "Error: $FILES_DIR is not a directory."
    exit 1
fi

# Process each file in the directory.
for file in "$FILES_DIR"/*; do
    if [ -f "$file" ]; then
        # Get the original file name.
        fname=$(basename "$file")
        echo "Packaging file '$fname' into docker image tagged '${IMAGE_NAME}:${fname}'..."

        # Create a temporary build directory.
        build_dir=$(mktemp -d)

        # Copy the file into the build context as "chunk".
        cp "$file" "$build_dir/chunk"

        # Create a Dockerfile using the minimal scratch image.
        cat <<EOF > "$build_dir/Dockerfile"
FROM scratch
COPY chunk /data/chunk
EOF

        # Build the docker image with the provided image name and the file name as tag.
        docker build -t "${IMAGE_NAME}:${fname}" "$build_dir"
        docker push  "${IMAGE_NAME}:${fname}"

        # Clean up the temporary build directory.
        rm -rf "$build_dir"
    fi
done
