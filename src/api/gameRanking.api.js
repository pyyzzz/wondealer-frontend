import axios from "axios";
import Common from "../utils/Common";

// 로그인 인증 없이 접근 가능한 public API 인스턴스 사용
const publicApi = axios.create({ baseURL: Common.API_URL });
// 메인 페이지 인기 게임 순위 목록 조회 (game_rank, game_img, game_name)
const GameRankingApi = {
  getGameRankings: () => {
    return publicApi.get("/api/rankings");
  },
};

export default GameRankingApi;
