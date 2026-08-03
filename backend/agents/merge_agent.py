class MergeAgent:

    def merge(self, website_result=None,
                    document_result=None,
                    memory_result=None,
                    ocr_result=None):

        contexts = []

        metadata = []

        if website_result:

            contexts.append(
                website_result["context"]
            )

            metadata.extend(
                website_result["metadata"]
            )

        if document_result:

            contexts.append(
                document_result["context"]
            )

            metadata.extend(
                document_result["metadata"]
            )

        if memory_result:

            contexts.append(
                memory_result["context"]
            )

        if ocr_result:

            contexts.append(
                ocr_result["context"]
            )

            metadata.extend(
                ocr_result["metadata"]
            )

        final_context = "\n\n".join(contexts)

        return {
            "context": final_context,
            "metadata": metadata
        }