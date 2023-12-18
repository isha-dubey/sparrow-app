use reqwest::{RequestBuilder, Response};
use serde_json::Value;

fn is_valid_json(input: &str) -> bool {
    match serde_json::from_str::<Value>(input) {
        Ok(_) => true,
        Err(_) => false,
    }
}

pub async fn make_json_request(
    request_builder: RequestBuilder,
    body: &str,
) -> Result<Response, Box<dyn std::error::Error + Send + Sync>> {
    let response;
    if is_valid_json(body) { 
        let valid_json: Value = serde_json::from_str(&body).unwrap();
        response = request_builder.json(&valid_json).send().await?;
    } else { 
        response = request_builder.json(&body).send().await?;
    }
    return Ok(response);
}
