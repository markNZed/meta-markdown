#!/bin/bash

# ------------------------------------------------------------------
# Script Name: concatenate_project.sh
# Description: Concatenates relevant project documentation and
#              code files into a single file for AI review.
#              For .ts files, only extracts header comments.
# Usage:        ./concatenate_project.sh
# ------------------------------------------------------------------

# Set the output file name
OUTPUT_FILE="project_review.txt"

# Remove the output file if it already exists to avoid appending
if [ -f "$OUTPUT_FILE" ]; then
    rm "$OUTPUT_FILE"
    echo "Existing $OUTPUT_FILE removed."
fi

# Define directories to exclude (separated by spaces)
EXCLUDE_DIRS=("node_modules" ".git" ".vscode" "dist" "build" "cache" "src/notebooks" "markdown_example" "markdown_private" "tests")

# Define file extensions to include (add or remove as needed)
INCLUDE_EXTENSIONS=("*.js" "*.ts" "*.json" "*.md" "*.ipynb" "*.txt")

# Define file regex patterns to exclude (e.g., "package-lock.json", "some-other-file.json")
EXCLUDE_FILES=("package-lock.json" ".env" "convert-js-to-ts.js" "lock.json" "notes.txt")

# Function to check if a file matches any exclude patterns
should_exclude_file() {
    local file="$1"
    for pattern in "${EXCLUDE_FILES[@]}"; do
        if [[ "$(basename "$file")" == "$pattern" ]]; then
            return 0 # The file matches an exclusion pattern
        fi
    done
    return 1 # The file does not match any exclusion patterns
}

# Function to extract header comments from a .ts file
extract_ts_header_comments() {
    local file="$1"
    # Initialize variables
    local in_block_comment=0
    local header_comments=""

    while IFS= read -r line; do
        # Check for start of block comment
        if [[ $in_block_comment -eq 0 && "$line" =~ ^[[:space:]]*/\* ]]; then
            in_block_comment=1
            header_comments+="$line"$'\n'
            # Check if block comment ends on the same line
            if [[ "$line" =~ \*/ ]]; then
                in_block_comment=0
            fi
            continue
        fi

        # Check for end of block comment
        if [[ $in_block_comment -eq 1 ]]; then
            header_comments+="$line"$'\n'
            if [[ "$line" =~ \*/ ]]; then
                in_block_comment=0
            fi
            continue
        fi

        # Check for single-line comment
        if [[ "$line" =~ ^[[:space:]]*// ]]; then
            header_comments+="$line"$'\n'
            continue
        fi

        # If the line is not a comment, stop processing
        break
    done < "$file"

    echo "$header_comments"
}

# Build the find command with exclusions
FIND_CMD="find ."

# Add exclusion patterns for directories to the find command
for DIR in "${EXCLUDE_DIRS[@]}"; do
    FIND_CMD+=" ! -path \"./$DIR/*\""
done

# Add inclusion patterns to the find command
FIND_CMD+=" \( "
for EXT in "${INCLUDE_EXTENSIONS[@]}"; do
    FIND_CMD+=" -name \"$EXT\" -o"
done
# Remove the trailing -o and close the parenthesis
FIND_CMD="${FIND_CMD% -o} \) -type f"

# Execute the find command and store the results
FILES=$(eval $FIND_CMD)

# Check if any files were found
if [ -z "$FILES" ]; then
    echo "No matching files found to concatenate."
    exit 0
fi

# Iterate over each file and append its content to the output file
for FILE in $FILES; do
    # Check if the file matches any exclusion pattern
    if should_exclude_file "$FILE"; then
        echo "Skipping $FILE (matches exclusion pattern)"
        continue
    fi

    # Add a header with the file name
    echo "===== File: $FILE =====" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"

    # Determine the file extension
    EXT="${FILE##*.}"

    if [[ "$EXT" == "ts" ]]; then
        # Extract and append only header comments for .ts files
        HEADER_COMMENTS=$(extract_ts_header_comments "$FILE")
        if [[ -n "$HEADER_COMMENTS" ]]; then
            echo "$HEADER_COMMENTS" >> "$OUTPUT_FILE"
        else
            echo "// No header comments found." >> "$OUTPUT_FILE"
        fi
    else
        # Append the entire file content for other file types
        cat "$FILE" >> "$OUTPUT_FILE"
    fi

    echo "" >> "$OUTPUT_FILE"

    # Add a footer for separation
    echo "===========================" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
done

echo "Concatenation complete. Output file created: $OUTPUT_FILE"
