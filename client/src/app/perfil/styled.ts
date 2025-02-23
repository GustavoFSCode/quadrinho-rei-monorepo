import styled from "styled-components";

export const ContentContainer = styled.div<{ isExpanded: boolean }>`
  background-color: #FFFFFF;
  margin-left: ${(props) => (props.isExpanded ? "200px" : "80px")};
  border-radius: 8px;
  padding-top: 32px;
  font-family: "Primary", sans-serif;
  transition: margin-left 0.3s ease;
  display: flex;
  height: 100vh;
  flex-direction: column;
`;

export const Header = styled.div`
  height: 91px; 
  width: 100%;
  text-align: left;
  margin-bottom: 10px;
  padding-left: 44px;
  font-size: 24px;
  font-weight: 400;
  color: #333;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: baseline;
`;

export const Content = styled.div`
  height: 75vh; 
  width: 500px;
  margin-left: 44px;
  margin-right: 44px;
  padding-bottom: 0;
  border-radius: 4px;
`;


export const ModalBodyRow = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;

    div {
        min-width: 0;
    }

    div.full-width {
        flex: 0 0 100%;
    }

    label {
        font-size: 16px;
        color: #2D2D2D;
        font-weight: 400;
        margin-left: 15px;
        padding-bottom: 3px;
    }
`;

export const ModalBodyText = styled.div`
    font-size: 20px;
    color: #2D2D2D;
    font-weight: 400;
    margin-top: 40px;
    margin-bottom: 20px;
`;

export const ModalBodyButton = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
`;

