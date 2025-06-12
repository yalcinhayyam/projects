import {
  useMemo,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Quill from "quill";

// Import built-in Quill modules
const Clipboard = Quill.import('modules/clipboard');

// Register clipboard module (though it's usually registered by default)
Quill.register('modules/clipboard', Clipboard);

const QuillEditor = forwardRef(
  ({ value, onChange, imageUploadEndpoint }, ref) => {
    const reactQuillRef = useRef(null);

    useImperativeHandle(ref, () => ({
      getEditor: () => reactQuillRef.current?.getEditor(),
    }));

    const imageHandler = useCallback(() => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.click();

      input.onchange = async () => {
        const file = input.files[0];
        if (!file) return;

        if (!imageUploadEndpoint) {
          console.error("Image upload endpoint is not provided.");
          return;
        }

        try {
          const formData = new FormData();
          formData.append("image", file);

          const response = await fetch(imageUploadEndpoint, {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Upload failed with status: ${response.status}`);
          }

          const result = await response.json();
          const imageUrl = result.imageUrl;

          const quill = reactQuillRef.current?.getEditor();
          const range = quill?.getSelection();
          if (quill && range) {
            quill.insertEmbed(range.index, "image", imageUrl);
          }
        } catch (error) {
          console.error("Image upload failed:", error);
          alert("Failed to upload image. Please try again.");
        }
      };
    }, [imageUploadEndpoint]);

    const modules = useMemo(
      () => ({
        toolbar: {
          container: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            ["blockquote", "code-block"],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ script: "sub" }, { script: "super" }],
            [{ indent: "-1" }, { indent: "+1" }],
            [{ direction: "rtl" }],
            [{ color: [] }, { background: [] }],
            [{ align: [] }],
            ["link", "image", "video"],
            ["clean"],
          ],
          handlers: {
            image: imageHandler,
          },
        },
        clipboard: {
          matchVisual: false,
          // Additional clipboard options
          matchers: [
            // Custom matcher to handle pasted content
            ['IMG', (node, delta) => {
              // Handle pasted images
              const src = node.getAttribute('src');
              if (src) {
                return delta.compose(new (Quill.import('delta'))().insert({ image: src }));
              }
              return delta;
            }]
          ]
        },
        // Removed imageUploader module configuration
        // The custom imageHandler above handles image uploads
      }),
      [imageHandler]
    );

    const formats = useMemo(
      () => [
        "header",
        "bold",
        "italic",
        "underline",
        "strike",
        "blockquote",
        "code-block",
        "list",
        "script",
        "indent",
        "direction",
        "color",
        "background",
        "align",
        "link",
        "image",
        "video",
      ],
      []
    );

    return (
      <ReactQuill
        ref={reactQuillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder="Write something amazing..."
      />
    );
  }
);

QuillEditor.displayName = "QuillEditor";

export default QuillEditor;