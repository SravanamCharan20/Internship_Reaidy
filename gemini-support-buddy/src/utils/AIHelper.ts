
import axios from "axios";
import { Document } from "../store/chatStore";

// Default car service knowledge that will be used if no documents are uploaded
const DEFAULT_CAR_SERVICE_KNOWLEDGE = `
# AutoCare Car Service Information

## Services Offered
- Oil Changes (Conventional, Synthetic Blend, Full Synthetic)
- Tire Services (Rotation, Balancing, Replacement, Alignment)
- Brake Services (Pad Replacement, Rotor Resurfacing, Fluid Flush)
- Engine Services (Tune-up, Diagnostics, Repair)
- Transmission Services (Fluid Change, Filter Replacement, Repair)
- Cooling System (Radiator Flush, Coolant Replacement)
- Air Conditioning (Recharge, Repair)
- Battery Services (Testing, Replacement)
- Electrical System Diagnostics
- Full Vehicle Inspections

## Pricing Information
- Basic Oil Change: $39.99 - $59.99 depending on vehicle type
- Synthetic Oil Change: $69.99 - $89.99
- Tire Rotation: $29.99
- Brake Pad Replacement: $149.99 - $249.99 per axle
- A/C Recharge: $89.99 - $129.99
- Battery Replacement: $149.99 - $249.99 (includes battery)
- Check Engine Light Diagnosis: $89.99 (waived with repair)

## Maintenance Schedules
- Every 3,000-5,000 miles: Oil change, tire rotation
- Every 15,000 miles: Air filter replacement
- Every 30,000 miles: Transmission fluid change, fuel filter replacement
- Every 50,000 miles: Spark plug replacement, coolant flush
- Every 60,000 miles: Timing belt inspection/replacement (if applicable)

## Warranty Information
- 12-month/12,000-mile warranty on parts and labor
- Lifetime warranty on brake pads and shoes
- 24-month warranty on batteries

## Business Hours
- Monday-Friday: 7:30 AM - 6:00 PM
- Saturday: 8:00 AM - 4:00 PM
- Sunday: Closed

## Contact Information
- Phone: (555) 123-4567
- Email: service@autocare.example.com
- Address: 1234 Auto Boulevard, Cartown, CT 12345
`;

export class AIHelper {
  private static API_KEY = "AIzaSyCVdcTRHxI4zYDLCUXg_jeYJI9s9LMAaYs"; // Your Gemini API key
  private static API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

  static async getResponse(query: string, documents: Document[]): Promise<string> {
    try {
      // Prepare context from documents or use default knowledge
      let context = "";
      
      if (documents.length > 0) {
        // Use admin-uploaded documents
        context = documents.map(doc => doc.content).join("\n\n");
      } else {
        // Use default car service knowledge
        context = DEFAULT_CAR_SERVICE_KNOWLEDGE;
      }

      const systemPrompt = 
        "You are AutoCare's AI assistant, an expert on automotive maintenance, repairs, and services. " +
        "Provide helpful, clear, and concise information about vehicle maintenance, common car problems, " +
        "services offered, pricing, and maintenance schedules. Always be professional, friendly, and " +
        "offer practical advice. If you're unsure about specific details, acknowledge this and provide " +
        "general guidance instead. When appropriate, suggest that the customer visit a service center " +
        "for a professional diagnosis or service." +
        "Important: Format your responses in clean, plain text without any special characters, asterisks, or markdown formatting. " +
        "Use standard paragraphs with clear spacing between them.";
      
      const userPrompt = `Based on the following information:\n\n${context}\n\nUser question: ${query}\n\nPlease provide a helpful response:`;

      const response = await axios.post(
        `${this.API_URL}?key=${this.API_KEY}`,
        {
          contents: [
            {
              role: "user",
              parts: [
                { text: systemPrompt },
                { text: userPrompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }
      );

      // Extract and clean the response text
      if (response.data.candidates && 
          response.data.candidates[0] && 
          response.data.candidates[0].content && 
          response.data.candidates[0].content.parts && 
          response.data.candidates[0].content.parts[0]) {
            
        // Get the raw text response
        let responseText = response.data.candidates[0].content.parts[0].text;
        
        // Clean up the response - remove markdown formatting
        responseText = responseText
          .replace(/\*\*/g, '') // Remove bold markers
          .replace(/\*/g, '')   // Remove italics/emphasis markers
          .replace(/`/g, '')    // Remove code markers
          .replace(/^#+\s+/gm, '') // Remove heading markers
          .replace(/^\s*[-*+]\s+/gm, '• ') // Convert list items to bullet points
          .trim();
          
        return responseText;
      }
      
      throw new Error("Invalid response format from Gemini API");

    } catch (error) {
      console.error("Error getting AI response:", error);
      throw new Error("Failed to get a response from the AI service. Please try again later.");
    }
  }
}
