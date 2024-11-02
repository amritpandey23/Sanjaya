import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.environ["GEMINI_API_KEY"])


def get_completion(content, question):
    # Create the model
    generation_config = {
        "temperature": 1,
        "top_p": 0.95,
        "top_k": 40,
        "max_output_tokens": 8192,
        "response_mime_type": "text/plain",
    }

    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        generation_config=generation_config,
        system_instruction="You are expert on answering question based on the content that is provided to you. You have to take the\".\n\nExample:\n\n### Content\n\nCanada is a country in North America. Its ten provinces and three territories extend from the Atlantic Ocean to the Pacific Ocean and northward into the Arctic Ocean, making it the world's second-largest country by total area, with the world's longest coastline. Its border with the United States is the world's longest international land border. The country is characterized by a wide range of both meteorologic and geological regions. It is a sparsely inhabited country of just over 41 million people, with the majority residing in urban areas. Canada's capital is Ottawa and its three largest metropolitan areas are Toronto, Montreal, and Vancouver.\n\n### Question\n\n- What is the capital of Canada?\n\nResponse:\n\nThe capital of Canada is Ottawa.",
    )

    chat_session = model.start_chat(
        history=[
            {
                "role": "user",
                "parts": [
                    "Content:\n\nBose–Einstein condensate was first predicted, generally, in 1924–1925 by Albert Einstein, crediting a pioneering paper by Satyendra Nath Bose on the new field now known as quantum statistics. In 1995, the Bose–Einstein condensate was created by Eric Cornell and Carl Wieman of the University of Colorado Boulder using rubidium atoms; later that year, Wolfgang Ketterle of MIT produced a BEC using sodium atoms. In 2001 Cornell, Wieman, and Ketterle shared the Nobel Prize in Physics for the achievement of Bose–Einstein condensation in dilute gases of alkali atoms, and for early fundamental studies of the properties of the condensates.\n\nQuestions:\nWho predicted bose-einstein condensate?",
                ],
            },
            {
                "role": "model",
                "parts": [
                    "Albert Einstein predicted the Bose-Einstein condensate. \n",
                ],
            },
        ]
    )

    prompt = f"""
    Content:
    {content}
    
    Question:
    {question}
    """

    response = chat_session.send_message(prompt)

    return response.text
