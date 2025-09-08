import { pipeline } from "@xenova/transformers";

let classifier: any = null;

async function getClassifier() {
  if (!classifier) {
    // Use Xenova's ONNX version of DistilBERT (supported!)
    classifier = await pipeline("zero-shot-classification", "Xenova/distilbert-base-uncased-mnli");
  }
  return classifier;
}

const candidateLabels = ["Interested", "Meeting Booked", "Not Interested", "Spam", "Out of Office"];

export async function categorizeEmail(subject: string, body: string): Promise<string> {
  const classifier = await getClassifier();
  const inputText = `${subject}\n${body}`;

  const result = await classifier(inputText, candidateLabels);
  return result.labels[0];
}
