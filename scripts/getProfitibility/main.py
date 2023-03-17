import func_arbitrage
import json
import time

# # Global Variable

'''
    Step 0: Finding coins which can be traded
    Exchange: biswap
    https://biswap.org/
'''


def step_0():
    # print("One hour sleep starting now...")
    # time.sleep(3600)
    print("Program Initiating...")
    f = open('C:/Users/Mr. Bushido/Desktop/Courses/BlockChain Work/flashloans/BiswapV1/getPairInfo.json', encoding="utf8")

    # returns JSON object as
    # a dictionary
    pairs = json.load(f)

    limit = len(pairs)
    print(limit)
    structured_pairs = func_arbitrage.structure_trading_pair(
        pairs, limit)  # Adjustables # 800
    # print(structured_pairs)
    # print(len(structured_pairs))

    surface_rates_list = []
    for t_pair in structured_pairs:
        surface_rate = func_arbitrage.calc_surface_rate(
            t_pair, min_rate=1, num=1)
        if len(surface_rate) > 0:
            surface_rates_list.append(surface_rate)

        # Save to JSON file
        if len(surface_rates_list) > 0:
            with open("getProfitibility.json", "w") as fp:
                json.dump(surface_rates_list, fp)
                print("File saved.")
        else:
            print("No Arb")

    #     # time.sleep(60)


# """ MAIN """
if __name__ == "__main__":
    step_0()

    # Format JSON ALT + SHIFT + F
    # """
    # the swap1Rate maybe wrong need to ajust in in first JS step
    # """
